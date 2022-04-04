import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "A concert",
      price: 20
    })
    .set("Cookie", signup())
    .expect(404)
})

it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "A concert",
      price: 20
    })
    .expect(401)
})

it("returns a 401 if the user does not own a ticket", async () => {
  const response = await request(app)
    .post(`/api/tickets`)
    .send({
      title: "A concert",
      price: 20
    })
    .set("Cookie", signup())
    .expect(201)


  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .send({
      title: "A new concert ticket",
      price: 20
    })
    .set("Cookie", signup())
    .expect(401)
})

it("returns a 400 if the user provided an invalid title or price", async () => {
  const cookie = signup()
  const response = await request(app)
    .post(`/api/tickets`)
    .send({
      title: "A concert",
      price: 20
    })
    .set("Cookie", cookie)
    .expect(201)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .send({
      title: "",
      price: 20
    })
    .set("Cookie", cookie)
    .expect(400)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .send({
      title: "A concert",
      price: -20
    })
    .set("Cookie", cookie)
    .expect(400)
})

it("it updates the ticket provided valid inputs", async () => {
  const cookie = signup()
  const response = await request(app)
    .post(`/api/tickets`)
    .send({
      title: "A concert",
      price: 20
    })
    .set("Cookie", cookie)
    .expect(201)

  const newTitle = "Another concert"
  const newPrice = 50
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .send({
      title: newTitle,
      price: newPrice
    })
    .set("Cookie", cookie)
    .expect(200)

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .expect(200)

  expect(ticketResponse.body.title).toEqual(newTitle)
  expect(ticketResponse.body.price).toEqual(newPrice)
})

it("publishes an event", async () => {
  const cookie = signup()
  const response = await request(app)
    .post(`/api/tickets`)
    .send({
      title: "A concert",
      price: 20
    })
    .set("Cookie", cookie)
    .expect(201)

  const newTitle = "Another concert"
  const newPrice = 50
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .send({
      title: newTitle,
      price: newPrice
    })
    .set("Cookie", cookie)
    .expect(200)

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2)
})

it("rejects updates if a ticket is reserved", async () => {
  const cookie = signup()
  const response = await request(app)
    .post(`/api/tickets`)
    .send({
      title: "A concert",
      price: 20
    })
    .set("Cookie", cookie)
    .expect(201)

  const ticket = await Ticket.findById(response.body.id)
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() })
  ticket!.save()

  const newTitle = "Another concert"
  const newPrice = 50
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .send({
      title: newTitle,
      price: newPrice
    })
    .set("Cookie", cookie)
    .expect(400)
})
