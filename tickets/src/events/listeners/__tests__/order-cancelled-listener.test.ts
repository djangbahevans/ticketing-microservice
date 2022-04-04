import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { IOrderCancelledEvent } from "../../../../lib"
import { Ticket } from "../../../models/ticket"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)

  const orderId = new mongoose.Types.ObjectId().toHexString()
  const ticket = Ticket.build({
    title: "A concert",
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString()
  })
  ticket.set({ orderId })
  await ticket.save()

  const data: IOrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id
    }
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { msg, data, orderId, listener, ticket }
}

it("updates the ticket, publish an event and acks the message", async () => {
  const { msg, data, listener, ticket } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)
  expect(updatedTicket!.orderId).not.toBeDefined()

  expect(msg.ack).toHaveBeenCalled()
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
