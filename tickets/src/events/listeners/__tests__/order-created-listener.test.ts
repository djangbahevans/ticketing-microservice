import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { IOrderCreatedEvent, OrderStatus } from "../../../../lib"
import { Ticket } from "../../../models/ticket"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)

  const ticket = Ticket.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    title: "A concert",
    price: 30
  })
  await ticket.save()

  const data: IOrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.CREATED,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date().toISOString(),
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    }
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg, ticket }
}

it("sets the orderId of the ticket", async () => {
  const { listener, data, msg, ticket } = await setup()

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.orderId).toEqual(data.id)
})


it("acks the message", async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it("publishes a ticket updated event", async () => {
  const { listener, data, msg, ticket } = await setup()

  await listener.onMessage(data, msg)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
  
  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
  expect(ticketUpdatedData.orderId).toEqual(data.id)
})
