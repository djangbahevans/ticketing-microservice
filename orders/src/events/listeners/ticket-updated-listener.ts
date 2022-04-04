import { Message } from "node-nats-streaming";
import { ITicketUpdatedEvent, Listener, Subjects } from "../../../lib";
import { Ticket } from "../../models";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<ITicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;

  queueGroupName = queueGroupName;

  async onMessage(data: ITicketUpdatedEvent["data"], msg: Message) {
    const ticket = await Ticket.findByEvent(data)
    if (!ticket)
      throw new Error("Ticket not found")

    const { title, price } = data;
    ticket.set({ title, price })
    await ticket.save()

    msg.ack()
  }
}
