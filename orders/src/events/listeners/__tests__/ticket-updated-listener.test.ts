import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { ITicketUpdatedEvent } from "../../../../lib"
import { Ticket } from "../../../models"
import { natsWrapper } from "../../../nats-wrapper"
import { TicketUpdatedListener } from "../ticket-updated-listener"

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client)

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "A concert",
    price: 20
  })
  await ticket.save()

  const data: ITicketUpdatedEvent["data"] = {
    id: ticket.id,
    title: "Another concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: ticket.version + 1
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, msg, data, ticket }
}

it("finds, updates, and saves a ticket", async () => {
  const { listener, msg, data, ticket } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
})

it("acks the message", async () => {
  const { listener, data, msg, ticket } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it("does not call ack if the event has a skipped version", async () => {
  const { msg, data, listener, ticket } = await setup()

  data.version = 3

  try {
    await listener.onMessage(data, msg)
  } catch (error) {
    
  }

  expect(msg.ack).not.toHaveBeenCalled()
})
