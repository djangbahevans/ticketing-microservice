import { IExpirationCompleteEvent, Publisher, Subjects } from "../../../lib";

export class ExpirationCompletePublisher extends Publisher<IExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
