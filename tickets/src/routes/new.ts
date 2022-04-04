import express, { Request, Response } from "express"
import { body } from "express-validator"
import { requireAuth, validateRequest } from "../../lib"
import { TicketCreatedPublisher } from "../events/publishers"
import { Ticket } from "../models/ticket"
import { natsWrapper } from "../nats-wrapper"

const router = express.Router()

router.post(
  "/api/tickets",
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
    const { title, price } = req.body;
    
    const ticket = Ticket.build({ title, price, userId: req.user!.id })
    await ticket.save();

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    })

    res.status(201).send(ticket)
  })

export { router as createTicketRouter }
