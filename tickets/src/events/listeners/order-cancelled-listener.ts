import { Message } from "node-nats-streaming";
import { IOrderCancelledEvent, Listener, Subjects } from "../../../lib";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<IOrderCancelledEvent>{
  readonly subject = Subjects.OrderCancelled;

  queueGroupName: string = queueGroupName;

  async onMessage(data: IOrderCancelledEvent["data"], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id)

    if (!ticket)
      throw new Error("Ticket not found");

    ticket.set({ orderId: undefined })
    await ticket.save()

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: undefined,
    })

    msg.ack()
  }
}
