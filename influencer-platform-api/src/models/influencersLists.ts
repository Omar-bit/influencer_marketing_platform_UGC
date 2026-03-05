import mongoose, { Schema, model } from 'mongoose';
export interface IBrandsInfluencersGroups {
  _id?: string | Schema.Types.ObjectId;
  businessId: string;
  influencers: Schema.Types.ObjectId[] | string[];
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const influencersListSchema = new Schema<IBrandsInfluencersGroups>(
  {
    businessId: {
      type: String,
      required: true,
    },
    influencers: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
export default mongoose.models.InfluencersLists ||
  mongoose.model('InfluencersLists', influencersListSchema);
