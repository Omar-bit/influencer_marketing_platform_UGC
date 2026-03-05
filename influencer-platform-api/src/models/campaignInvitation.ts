import mongoose, { Schema, model } from 'mongoose';

export interface ICampaignInvitation {
  _id?: string | Schema.Types.ObjectId;
  campaign: Schema.Types.ObjectId | string;
  influencer: Schema.Types.ObjectId | string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt?: Date;
  updatedAt?: Date;
}

const campaignInvitationSchema = new Schema<ICampaignInvitation>(
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
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
      required: true,
    },
  },
  { timestamps: true }
);

// Create a compound index to ensure uniqueness of campaign-influencer pairs
campaignInvitationSchema.index(
  { campaign: 1, influencer: 1 },
  { unique: true }
);

export default mongoose.models.CampaignInvitation ||
  model<ICampaignInvitation>('CampaignInvitation', campaignInvitationSchema);
