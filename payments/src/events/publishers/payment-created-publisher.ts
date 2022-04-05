import { IPaymentCreatedEvent, Publisher, Subjects } from "../../../lib";

export class PaymentCreatedPublisher extends Publisher<IPaymentCreatedEvent> {
  readonly subject= Subjects.PaymentCreated;
}
