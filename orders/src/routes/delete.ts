import express, { Request, Response } from "express"
import { NotAuthorizedError, NotFoundError, OrderStatus } from "../../lib"
import { Order } from "../models"

const router = express.Router()

router.delete(
  "/api/orders/:orderId",
  async (req: Request, res: Response) => {
    const { orderId } = req.params

    const order = await Order.findById(orderId)
    if (!order)
      throw new NotFoundError()

    if (order.userId !== req.user!.id)
      throw new NotAuthorizedError()

    order.status = OrderStatus.CANCELLED

    res.status(204).send(order)
  }
)

export { router as deleteOrderRouter }

