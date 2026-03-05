import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaignContent extends Document {
  application: mongoose.Types.ObjectId;
  title: string;
  description: string;
  collaborator?: string;
  tags: string[];
  contentAssets: string[]; // files
  additionalNotes?: string;
  status: 'pending' | 'posted' | 'rejected' | 'accepted';
  reason?: string | null;
  socialMediaPlatforms: [];
  isPaid: boolean;
  paymentRef?: string | null;
  posts?: {
    platform: 'instagram' | 'tiktok' | 'youtube' | 'facebook';
    postId: string;
    url?: string;
    metrics?: {
      likes?: number;
      comments?: number;
      views?: number;
      shares?: number;
      reach?: number;
      // impressions?: number;
      fetchedAt?: Date;
    }[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const CampaignContentSchema: Schema = new Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InfluencerApplication',
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    collaborator: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    contentAssets: {
      type: [String], // Array of file paths
      required: true,
    },
    additionalNotes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'posted', 'rejected', 'accepted'],
      default: 'pending',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentRef: {
      type: String,
      default: null,
    },
    reason: {
      type: String,
      default: null,
    },
    socialMediaPlatforms: {
      type: [
        { type: String, enum: ['instagram', 'tiktok', 'youtube', 'facebook'] },
      ],
      required: true,
    },
    posts: {
      type: [
        {
          platform: {
            type: String,
            enum: ['instagram', 'tiktok', 'youtube', 'facebook'],
            required: true,
          },
          postId: {
            type: String,
            required: true,
          },
          url: {
            type: String,
          },
          metrics: {
            type: [
              {
                likes: { type: Number, required: false, default: 0 },
                comments: { type: Number, required: false, default: 0 },
                views: { type: Number, required: false, default: 0 },
                shares: { type: Number, required: false, default: 0 },
                reach: { type: Number, required: false, default: 0 },
                // impressions: { type: Number, required: false, default: 0 },
                fetchedAt: { type: Date, default: Date.now },
              },
            ],
            default: [],
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.CampaignContent ||
  mongoose.model<ICampaignContent>('CampaignContent', CampaignContentSchema);
