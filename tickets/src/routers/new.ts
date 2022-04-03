import express, { Request, Response } from "express"
import { body } from "express-validator"
import { requireAuth, validateRequest } from "../../lib"
import { Ticket } from "../models/ticket"

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
    await ticket.save()

    res.status(201).send(ticket)
  })

export { router as createTicketRouter }
