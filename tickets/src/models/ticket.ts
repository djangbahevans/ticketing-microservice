import mongoose from "mongoose";

interface ITicketAttrs {
  title: string
  price: number
  userId: string
}

interface ITicketDocument extends mongoose.Document {
  title: string
  price: number
  userId: string
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

const Ticket = mongoose.model<ITicketDocument, ITicketModel>("Tickets", ticketSchema);

export { Ticket }
