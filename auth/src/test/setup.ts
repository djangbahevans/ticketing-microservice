import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";

declare global {
  function signup(): Promise<string[]>
}

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.JWT_KEY = "jwt"
  // process.env.NODE_ENV = "test"

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri)
})

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongo.stop()
})

global.signup = async () => {
  const email = "test@test.com"
  const password = "password"

  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email,
      password
    })
    .expect(201)

  const cookie = response.get("Set-Cookie")

  return cookie
}
