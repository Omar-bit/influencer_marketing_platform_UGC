import mongoose, { model, Schema, Types } from 'mongoose';

const SubscriptionSchema = new Schema(
  {
    userId: { required: true, type: Types.ObjectId, ref: 'User' },
    planId: { required: true, type: Types.ObjectId, ref: 'SubscriptionPlan' },
    startDate: { required: true, type: Date },
    endDate: { required: true, type: Date },
    status: {
      required: true,
      type: String,
      enum: ['unpaid', 'paid', 'cancelled'],
      default: 'unpaid',
    },
    paymentRef: { type: String },
    remainingCampaigns: { type: Number, default: 0, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Subscription ||
  model('Subscription', SubscriptionSchema);
