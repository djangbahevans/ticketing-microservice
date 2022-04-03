import { ITicketCreatedEvent, Publisher, Subjects } from "../../../lib";

export class TicketCreatedPublisher extends Publisher<ITicketCreatedEvent>{
  readonly subject = Subjects.TicketCreated;
}
