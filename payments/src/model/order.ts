import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { OrderStatus } from "../../lib";

interface IOrderAttrs {
  id: string
  status: OrderStatus
  version: number
  userId: string
  price: number
}

interface IOrderDocument extends mongoose.Document {
  status: OrderStatus
  version: number
  userId: string
  price: number
}

interface IOrderModel extends mongoose.Model<IOrderDocument> {
  build(attrs: IOrderAttrs): IOrderDocument
}

const orderSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
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

orderSchema.set("versionKey", "version")
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = (attrs: IOrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    price: attrs.price,
    userId: attrs.userId,
    status: attrs.status
  })
}

const Order = mongoose.model<IOrderDocument, IOrderModel>("Order", orderSchema)

export { Order }
