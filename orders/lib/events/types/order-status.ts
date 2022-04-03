export enum OrderStatus {
  // When the order has been created but ticket it is
  // trying to order has not been reserved
  CREATED = "created",

  // The ticket the order is trying to reserve has already
  // been reserved, or when the user has cancelled the order
  // And if the order expires before payment
  CANCELLED = "cancelled",

  // The order has successfully reserved the ticket
  AWAITING_PAYMENT = "awaiting:payment",

  // The order has reserved the ticket and the user has provided payment successfully
  COMPLETE = "complete",
}
