import mongoose from "mongoose";
import { Order, OrderStatus } from "./order";
import { updateIfCurrentPlugin } from "mongoose-update-if-current"

interface ITicketAttrs {
  id: string
  title: string;
  price: number;
}

export interface ITicketDocument extends mongoose.Document {
  title: string;
  price: number;
  version: number
  isReserved(): Promise<boolean>
}

interface ITicketModel extends mongoose.Model<ITicketDocument> {
  build(attrs: ITicketAttrs): ITicketDocument
  findByEvent(event: { id: string, version: number }): Promise<ITicketDocument | null>
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
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price
  })
}

ticketSchema.statics.findByEvent = async (event: { id: string, version: number }) => {
  return await Ticket.findOne({
    _id: event.id,
    version: event.version - 1
  })
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

ticketSchema.set("versionKey", "version")
ticketSchema.plugin(updateIfCurrentPlugin)

const Ticket = mongoose.model<ITicketDocument, ITicketModel>("Ticket", ticketSchema)

export { Ticket }
