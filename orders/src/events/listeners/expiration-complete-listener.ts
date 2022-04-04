import { Message } from "node-nats-streaming";
import { IExpirationCompleteEvent, Listener, OrderStatus, Subjects } from "../../../lib";
import { Order } from "../../models";
import { natsWrapper } from "../../nats-wrapper";
import { OrderCancelledPublisher } from "../publishers";
import { queueGroupName } from "./queue-group-name";

export class ExpirationCompleteListener extends Listener<IExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;

  queueGroupName: string = queueGroupName

  async onMessage(data: IExpirationCompleteEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId).populate("ticket")
    if (!order)
      throw new Error("Order not found");

    order.set({
      status: OrderStatus.CANCELLED
    })
    await order.save()

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id
      }
    })

    msg.ack()
  }
}
