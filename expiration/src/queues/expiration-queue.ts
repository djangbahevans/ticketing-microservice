import Bull from "bull"
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-publisher"
import { natsWrapper } from "../nats-wrapper"

interface IPayload {
  orderId: string
}

const expirationQueue = new Bull<IPayload>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST
  }
})

expirationQueue.process(async (job) => {
  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId
  })
})

export { expirationQueue }
