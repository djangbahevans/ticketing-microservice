import request from "supertest"
import { app } from "../../app"
import { Ticket } from "../../models"

const buildTicket = async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 20
  })

  return await ticket.save()
}

it("fetches orders for a particular user", async () => {
  // Create 3 tickets
  const ticketOne = await buildTicket()
  const ticketTwo = await buildTicket()
  const ticketThree = await buildTicket()

  const userOne = signup()
  const userTwo = signup()

  // Create order as userOne
  await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201)

  // Create 2 orders as userTwo
  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201)

  const { body: orderTwo } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201)

  // Make reqeust to get orders for userTwo
  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwo)
    .send()
    .expect(200)
  
    console.log(response.body)

  expect(response.body.length).toEqual(2)
  expect(response.body[0].id).toEqual(orderOne.id)
  expect(response.body[1].id).toEqual(orderTwo.id)
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id)
  expect(response.body[1].ticket.id).toEqual(ticketThree.id)
})
