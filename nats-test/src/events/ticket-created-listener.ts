import { Message } from "node-nats-streaming"
import { Listener } from "."
import { Subjects } from "./subjects"
import { ITicketCreatedEvent } from "./ticket-created-event"

class TicketCreatedListener extends Listener<ITicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
  queueGroupName: string = "payments-service"

  onMessage(data: ITicketCreatedEvent["data"], msg: Message): void {
    console.log("Event data", data)
    
    msg.ack()
  }
}

export { TicketCreatedListener }
