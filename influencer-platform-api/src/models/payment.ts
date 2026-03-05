import mongoose, { Document, Schema, model } from 'mongoose';

export interface IPayment extends Document {
  campaign: Schema.Types.ObjectId;
  influencer: Schema.Types.ObjectId;
  amount: number;
  body: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
const PaymentSchema = new Schema<IPayment>(
  {
    campaign: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    influencer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
PaymentSchema.index({ campaign: 1 });
PaymentSchema.index({ influencer: 1 });
PaymentSchema.index({ campaign: 1, influencer: 1 });
export default mongoose.models.Payment ||
  mongoose.model<IPayment>('Payment', PaymentSchema);
