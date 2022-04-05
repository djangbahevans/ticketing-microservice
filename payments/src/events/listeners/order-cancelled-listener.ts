import { Message } from "node-nats-streaming";
import { IOrderCancelledEvent, Listener, OrderStatus, Subjects } from "../../../lib";
import { Order } from "../../model/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<IOrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;

  queueGroupName: string = queueGroupName

  async onMessage(data: IOrderCancelledEvent["data"], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version
    })

    if (!order)
      throw new Error("Order not found");

    order.set({ status: OrderStatus.CANCELLED })
    await order.save()

    msg.ack()
  }
}
