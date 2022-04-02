import { app } from "../../app";
import request from "supertest"

const createTicket = () => {
  return request(app)
    .post("/api/tickets")
    .set("Cookie", signup())
    .send({
      title: "A ticket",
      price: 20
    })
}

it("can fetch a list of tickets", async () => {
  await createTicket()
  await createTicket()
  await createTicket()

  const response = await request(app)
    .get("/api/tickets")
    .send()
    .expect(200)

  expect(response.body.length).toEqual(3)
})
