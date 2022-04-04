import { Subjects } from "./subjects";

export interface IExpirationCompleteEvent {
  subject: Subjects.ExpirationComplete
  data: {
    orderId: string
  }
}
