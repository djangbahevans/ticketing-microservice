import mongoose from "mongoose"
import request from "supertest"
import { app } from "../../app"
import { Order, OrderStatus, Ticket } from "../../models"
import { natsWrapper } from "../../nats-wrapper"

it("cancels an order", async () => {
  const ticket = Ticket.build({
    title: "A title",
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString()
  })
  await ticket.save()

  const user = signup()

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201)

  const response = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204)

  const updatedOrder = await Order.findById(order.id)
  expect(updatedOrder?.status).toEqual(OrderStatus.CANCELLED)
})

it("emits an order cancelled event", async () => {
  const ticket = Ticket.build({
    title: "A title",
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString()
  })
  await ticket.save()

  const user = signup()

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201)

  const response = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
