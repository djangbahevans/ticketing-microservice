import request from "supertest"
import { app } from "../../app"
import { Order, OrderStatus, Ticket } from "../../models"

it("cancels an order", async () => {
  const ticket = Ticket.build({
    title: "A title",
    price: 20
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
  expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED)
})

it.todo("emits an order cancelled event")
