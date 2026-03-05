import mongoose, { Schema, model, Document } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  name: 'Free' | 'Launch' | 'Pro' | 'Premium';
  price: number; // 0 for Free
  offeredCampaigns: number; // null for unlimited
  description?: string;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>({
  name: {
    type: String,
    required: true,
    enum: ['Free', 'Launch', 'Pro', 'Premium'],
    unique: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  offeredCampaigns: {
    type: Number,
    required: true,
    default: 0, // null means unlimited
  },
  description: {
    type: String,
  },
});

export default mongoose.models.SubscriptionPlan ||
  model<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanSchema);
