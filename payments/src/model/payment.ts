import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { OrderStatus } from "../../lib";

interface IPaymentAttrs {
  orderId: string
  stripeId: string
}

interface IPaymentDocument extends mongoose.Document {
  orderId: string
  stripeId: string
}

interface IOrderModel extends mongoose.Model<IPaymentDocument> {
  build(attrs: IPaymentAttrs): IPaymentDocument
}

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  stripeId: {
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

// orderSchema.set("versionKey", "version")
// orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = (attrs: IPaymentAttrs) => {
  return new Payment(attrs)
}

const Payment = mongoose.model<IPaymentDocument, IOrderModel>("Payment", orderSchema)

export { Payment }
