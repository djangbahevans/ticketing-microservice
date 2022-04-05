import { Message } from "node-nats-streaming";
import { IOrderCreatedEvent, Listener, OrderStatus, Subjects } from "../../../lib";
import { Order } from "../../model/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<IOrderCreatedEvent> {
  readonly subject =  Subjects.OrderCreated;
  
  queueGroupName: string = queueGroupName
  
  async onMessage(data: IOrderCreatedEvent["data"], msg: Message) {
    const order = Order.build({
      id: data.id,
      version: data.version,
      status: data.status,
      userId: data.userId,
      price: data.ticket.price
    })
    await order.save()

    msg.ack();
  }
}
