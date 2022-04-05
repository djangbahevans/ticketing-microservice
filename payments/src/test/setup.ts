import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

declare global {
  function signup(id?: string): string[]
}

let mongo: MongoMemoryServer;

jest.mock('../nats-wrapper')

// TODO: Add Stripe Key for integration test
// process.env.STRIPE_KEY = ""

beforeAll(async () => {
  process.env.JWT_KEY = "jwt"
  process.env.NODE_ENV = "test"

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri)
})

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({})
  }

  jest.clearAllMocks()
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongo.stop()
})

global.signup = (id?: string) => {
  // Build a JWT payload { id, email }
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com"
  }

  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!)

  // Build session object { jwt: MY_JWT }
  const session = { jwt: token }

  // Turn object into JSON
  const sessionJSON = JSON.stringify(session)

  // Encode JSON as Base64
  const base64 = Buffer.from(sessionJSON).toString("base64")

  // Return a string that's the cookie with the encoded data
  return [`session=${base64}`]
}
