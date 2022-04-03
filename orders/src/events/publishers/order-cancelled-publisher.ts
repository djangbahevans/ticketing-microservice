import { IOrderCancelledEvent, Publisher, Subjects } from "../../../lib";

export class OrderCancelledPublisher extends Publisher<IOrderCancelledEvent>{
  readonly subject = Subjects.OrderCancelled;
}
