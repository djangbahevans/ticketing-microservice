import { Publisher } from "./base-publisher";
import { Subjects } from "./subjects";
import { ITicketCreatedEvent } from "./ticket-created-event";

export class TicketCreatedPublisher extends Publisher<ITicketCreatedEvent>  {
  readonly subject = Subjects.TicketCreated
}
