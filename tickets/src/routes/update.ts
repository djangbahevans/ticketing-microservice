import express, { Request, Response } from "express"
import { body } from "express-validator"
import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError } from "../../lib"
import { TicketUpdatedPublisher } from "../events/publishers"
import { Ticket } from "../models/ticket"
import { natsWrapper } from "../nats-wrapper"

const router = express.Router()

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title")
      .notEmpty()
      .withMessage("Title is required"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be greater than or equal to zero")
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { id } = req.params
    const { price, title } = req.body

    const ticket = await Ticket.findById(id)
    if (!ticket)
      throw new NotFoundError()

    if (ticket.userId !== req.user?.id)
      throw new NotAuthorizedError()

    ticket.set({ title, price })
    await ticket.save()

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId
    })

    res.send(ticket)
  })

export { router as updateTicketRouter }

