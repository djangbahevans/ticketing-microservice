import { Message } from "node-nats-streaming";
import { ITicketCreatedEvent, Listener, Subjects } from "../../../lib";
import { Ticket } from "../../models";
import { queueGroupName } from "./queue-group-name";

export class TicketCreatedListener extends Listener<ITicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;

  queueGroupName: string = queueGroupName;

  async onMessage(data: ITicketCreatedEvent["data"], msg: Message) {
    const { id, title, price } = data;
    const ticket = Ticket.build({
      id,
      title,
      price
    })
    await ticket.save()

    msg.ack()
  }
}
