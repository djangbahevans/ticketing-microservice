import mongoose from "mongoose";
import { Order, OrderStatus } from "./order";

interface ITicketAttrs {
  title: string;
  price: number;
}

export interface ITicketDocument extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>
}

interface ITicketModel extends mongoose.Model<ITicketDocument> {
  build(attrs: ITicketAttrs): ITicketDocument

}

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id
      delete ret._id
    }
  }
})


ticketSchema.statics.build = (attrs: ITicketAttrs) => {
  return new Ticket(attrs)
}

ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.CREATED,
        OrderStatus.AWAITING_PAYMENT,
        OrderStatus.COMPLETE
      ]
    }
  })

  return !!existingOrder;
}

const Ticket = mongoose.model<ITicketDocument, ITicketModel>("Ticket", ticketSchema)

export { Ticket }
