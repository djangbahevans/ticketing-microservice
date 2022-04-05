import mongoose from "mongoose"
import { IOrderCancelledEvent, OrderStatus } from "../../../../lib"
import { Order } from "../../../model/order"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.CREATED,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 10
  })
  await order.save()

  const data: IOrderCancelledEvent["data"] = {
    id: order.id,
    version: order.version,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
    }
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { order, listener, data, msg }
}

it("updates the status of the order", async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)
  
  const updatedOrder = await Order.findById(data.id)
  
  expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED)
})

it("acks the message",async () => {
  const { listener, data, msg } = await setup()
  
  await listener.onMessage(data, msg)
  
  expect(msg.ack).toHaveBeenCalled()
})
