import mongoose from "mongoose";
import { app } from "./app";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { natsWrapper } from "./nats-wrapper";


const start = async () => {
  console.log("Starting up...")
  
  if (!process.env.JWT_KEY)
    throw new Error("JWT_KEY environment variable must be defined")
  if (!process.env.MONGO_URI)
    throw new Error("MONGO_URI environment variable must be defined");
  if (!process.env.NATS_URL)
    throw new Error("NATS_URL environment variable must be defined");
  if (!process.env.NATS_CLIENT_ID)
    throw new Error("NATS_CLIENT_ID environment variable must be defined");
  if (!process.env.NATS_CLUSTER_ID)
    throw new Error("NATS_CLUSTER_ID environment variable must be defined");

  try {
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)

    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed")
      process.exit()
    })

    process.on("SIGTERM", () => natsWrapper.client.close())
    process.on("SIGINT", () => natsWrapper.client.close())

    new OrderCancelledListener(natsWrapper.client).listen()
    new OrderCreatedListener(natsWrapper.client).listen()

    await mongoose.connect(process.env.MONGO_URI!)
    console.log("Connected to MongoDB")
  } catch (error) {
    console.error(error)
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000')
  })
}

start()
