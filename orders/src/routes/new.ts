import express, { Request, Response } from "express"
import { body } from "express-validator"
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from "../../lib"
import { Order, Ticket } from "../models"

const router = express.Router()

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .notEmpty()
      .isMongoId()
      // .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided")
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body

    // Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId)
    if (!ticket)
      throw new NotFoundError()

    // Make sure the ticket is not already reserved
    const isReserved = await ticket.isReserved()
    if (isReserved)
      throw new BadRequestError("Ticket is already reserved")

    // Calculate an expiration date for the order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    // Build the order and save it to the database
    const order = Order.build({
      userId: req.user!.id,
      status: OrderStatus.CREATED,
      expiresAt: expiration,
      ticket
    })
    await order.save()

    // TODO: Publish an event saying that an event was created

    res.status(201).send(order)
  }
)

export { router as createOrderRouter }

