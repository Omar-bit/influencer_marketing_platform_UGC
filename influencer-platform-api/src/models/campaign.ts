import mongoose, { Schema, model } from 'mongoose';

export interface ICampaign {
  _id?: string | Schema.Types.ObjectId;
  name: string;
  description: string;
  budget: number;
  startDate?: Date;
  endDate?: Date;
  isSponsored?: boolean;
  image?: string;
  business: Schema.Types.ObjectId | string;
  platforms: string[];
  nbrOfInfluencers?: number;
  contentRequirements?: string;
  country?: string;
  reachTarget?: number;
  engagementRate?: number;
  conversionTarget?: number;
  customGoal?: string;
  model?: string;
  ecommerceCategory?: string;
  tags: string;
  clicks?: number;
  status: 'draft' | 'review' | 'pending' | 'closed';
  paymentRef?: string;
  product?: Schema.Types.ObjectId | string;
  affiliate?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  isPublic: boolean;
  enableProductPurchase: boolean;
  targetedInfluencerLists?: Schema.Types.ObjectId[] | string[];
  invitedInfluencers?: Schema.Types.ObjectId[] | string[];
}

const AffiliateSchema = new Schema({
  type: { type: String, enum: ['percentage', 'fixed'] },
  value: { type: Number },
});

const CampaignSchema = new Schema<ICampaign>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Step 1 Goal
    model: { type: String },
    reachTarget: { type: Number },
    engagementRate: { type: Number },
    conversionTarget: { type: Number },
    customGoal: { type: String },

    // Step 2 Campaign Details
    name: { type: String, required: true },
    description: { type: String, required: true },
    ecommerceCategory: { type: String },
    tags: { type: String },
    country: { type: String },
    image: { type: String },

    // Step 3 Campaign Timing and Budget
    isSponsored: { type: Boolean, default: false },
    startDate: { type: Date },
    endDate: { type: Date },
    budget: { type: Number, required: true },

    // Step 4 Campaign Product and Affiliate
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: false },
    affiliate: { type: AffiliateSchema, default: null },
    enableProductPurchase: { type: Boolean, default: false },

    // Step 5 Campaign Platforms and Influencers
    platforms: {
      type: [String],
      default: [],
    },
    nbrOfInfluencers: { type: Number },
    contentRequirements: { type: String },
    isPublic: { type: Boolean, default: true },
    targetedInfluencerLists: [
      { type: Schema.Types.ObjectId, ref: 'InfluencersLists' },
    ],
    invitedInfluencers: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    // Campaign Status and Analytics
    status: {
      type: String,
      enum: ['draft', 'review', 'pending', 'closed'],
      default: 'draft',
    },
    paymentRef: { type: String },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CampaignSchema.index({ business: 1 });
CampaignSchema.index({ name: 'text', description: 'text' });
CampaignSchema.index({ tags: 'text' });

export default mongoose.models.Campaign ||
  model<ICampaign>('Campaign', CampaignSchema);
