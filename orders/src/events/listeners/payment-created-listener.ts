import { Message } from "node-nats-streaming";
import { IPaymentCreatedEvent, Listener, OrderStatus, Subjects } from "../../../lib";
import { Order } from "../../models";
import { queueGroupName } from "./queue-group-name";

export class PaymentCreatedListener extends Listener<IPaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: IPaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId)
    if (!order)
      throw new Error("Order not found")

    order.set({ status: OrderStatus.COMPLETE })
    order.save()

    msg.ack()
  }

}
