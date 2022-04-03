import { IOrderCreatedEvent, Publisher, Subjects } from "../../../lib";

export class OrderCreatedPublisher extends Publisher<IOrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
