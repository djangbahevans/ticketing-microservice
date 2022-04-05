import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from "../../lib";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { Order } from "../model/order";
import { Payment } from "../model/payment";
import { natsWrapper } from "../nats-wrapper";
import { stripe } from "../stripe";

const router = Router()

router.post(
  "/api/payments",
  requireAuth,
  [
    body("token")
      .notEmpty(),
    body("orderId")
      .notEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body

    const order = await Order.findById(orderId)
    if (!order)
      throw new NotFoundError()
    if (order.userId !== req.user!.id)
      throw new NotAuthorizedError()
    if (order.status === OrderStatus.CANCELLED)
      throw new BadRequestError("Cannot paid for a cancelled order")

    const charge = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token
    })

    const payment = Payment.build({
      orderId: orderId,
      stripeId: charge.id
    })
    await payment.save()

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      orderId: payment.orderId,
      stripeId: payment.stripeId,
      id: payment.id
    })

    res.status(201).send({ id: payment.id })
  })

export { router as createChargeRouter }
