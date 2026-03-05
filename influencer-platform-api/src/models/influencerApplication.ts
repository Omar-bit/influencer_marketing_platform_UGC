import mongoose, { Schema, model } from 'mongoose';

export interface IInfluencerApplication extends Document {
  campaign: Schema.Types.ObjectId;
  name: string;
  influencer: Schema.Types.ObjectId;
  proposal: string;
  status: 'pending' | 'accepted' | 'rejected';
  price?: number;
  rating: {
    feedback?: string;
    rating?: number;
  };
  productUrlCode?: string;
  createdAt: Date;
  updatedAt: Date;
}
const InfluencerApplicationSchema = new Schema<IInfluencerApplication>(
  {
    campaign: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    influencer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    proposal: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'accepted', 'rejected'],
    },
    price: {
      type: Number,
      required: false,
    },
    rating: {
      type: {
        feedback: { type: String, default: '', required: false },
        rating: { type: Number, default: 0, required: true },
      },
      default: null,
    },
    productUrlCode: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);
InfluencerApplicationSchema.index({ campaign: 1 });
InfluencerApplicationSchema.index({ influencer: 1 });
InfluencerApplicationSchema.index({ campaign: 1, influencer: 1 });
InfluencerApplicationSchema.index(
  { productUrlCode: 1 },
  { unique: true, sparse: true }
);

export default mongoose.models.InfluencerApplication ||
  mongoose.model<IInfluencerApplication>(
    'InfluencerApplication',
    InfluencerApplicationSchema
  );
