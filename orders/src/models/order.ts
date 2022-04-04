import mongoose from "mongoose";
import { ITicketDocument } from ".";
import { OrderStatus } from "../../lib";
import {updateIfCurrentPlugin} from "mongoose-update-if-current"

export { OrderStatus }

interface IOrderAttrs {
  userId: string
  status: OrderStatus
  expiresAt: Date
  ticket: ITicketDocument
}

interface IOrderDocument extends mongoose.Document {
  userId: string
  status: OrderStatus
  expiresAt: Date
  version: number
  ticket: ITicketDocument
}

interface IOrderModel extends mongoose.Model<IOrderDocument> {
  build(attrs: IOrderAttrs): IOrderDocument
}

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.CREATED
  },
  expiresAt: {
    type: mongoose.Schema.Types.Date
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  }
}, {
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id
      delete ret._id
    }
  }
})

orderSchema.set("versionKey", "version")
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = (attrs: IOrderAttrs) => {
  return new Order(attrs)
}

const Order = mongoose.model<IOrderDocument, IOrderModel>("Orders", orderSchema)

export { Order }
