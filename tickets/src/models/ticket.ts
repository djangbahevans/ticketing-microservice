import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface ITicketAttrs {
  title: string
  price: number
  userId: string
}

interface ITicketDocument extends mongoose.Document {
  title: string
  price: number
  userId: string
  version: number
  orderId?: string
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
  },
  userId: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
  }
}, {
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id
      delete ret._id
    }
  }
})
ticketSchema.set("versionKey", "version")
ticketSchema.plugin(updateIfCurrentPlugin)

ticketSchema.statics.build = (attrs: ITicketAttrs) => {
  return new Ticket(attrs)
}

const Ticket = mongoose.model<ITicketDocument, ITicketModel>("Tickets", ticketSchema);

export { Ticket }
