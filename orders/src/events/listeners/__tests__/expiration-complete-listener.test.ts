import mongoose from "mongoose"
import { IExpirationCompleteEvent, OrderStatus } from "../../../../lib"
import { Order, Ticket } from "../../../models"
import { natsWrapper } from "../../../nats-wrapper"
import { ExpirationCompleteListener } from "../expiration-complete-listener"


const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client)

  const ticket = Ticket.build({
    title: "A concert",
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 20
  })
  await ticket.save()

  const order = Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.CREATED,
    expiresAt: new Date(),
    ticket
  })
  await order.save()

  const data: IExpirationCompleteEvent["data"] = {
    orderId: order.id
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg, ticket, order }
}

it("updates the order status to cancelled", async () => {
  const { listener, data, msg, order } = await setup()
  
  await listener.onMessage(data, msg)

  const updatedOrder = await Order.findById(order.id)

  expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED)
})


it("emits order cancelled event",async () => {
  const { listener, data, msg, order } = await setup()
  
  await listener.onMessage(data, msg)

  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
  expect(eventData.id).toEqual(order.id)
})

it("acks the message",async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)
  
  expect(msg.ack).toHaveBeenCalled()
})
