import { ITicketCreatedEvent, ITicketUpdatedEvent, Publisher, Subjects } from "../../../lib";

export class TicketUpdatedPublisher extends Publisher<ITicketUpdatedEvent>{
  readonly subject = Subjects.TicketUpdated
}
