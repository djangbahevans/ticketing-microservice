import { Message } from "node-nats-streaming";
import { IOrderCreatedEvent, Listener, Subjects } from "../../../lib";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<IOrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;

  queueGroupName: string = queueGroupName

  async onMessage(data: IOrderCreatedEvent["data"], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id)
    if (!ticket)
      throw new Error("Ticket not found");

    ticket.set({ orderId: data.id })

    await ticket.save()
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId
    })

    msg.ack()
  }
}
