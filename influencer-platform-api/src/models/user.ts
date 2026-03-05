import mongoose, { Schema, model, CallbackError, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  _id: string;
  type: 'influencer' | 'business' | 'admin';
  provider: 'local' | 'google' | 'facebook';
  name: string;
  username?: string;
  email: string;
  dateOfBirth?: Date;
  gender?: 'F' | 'M';
  password?: string;
  status: 'active' | 'inactive';
  walletId?: string;
  verified: boolean;
  phone?: string;
  secondPhone?: string;
  address?: {
    country: { type: String };
    city: { type: String };
    timeZone: { type: String };
  };
  profilePicture?: string;
  bio?: string;
  description?: string;
  website?: string;
  primaryNiche?: string;
  secondaryNiches?: string[];
  mainContentTypes?: string;
  brandTone?: string;
  previousCollaborations?: string;
  portfolio?: string[];
  collaborationType?: string;
  preferredIndustry?: string;
  minimumRates?: {
    perReel?: string[];
    perCarousel?: string[];
    perCarouselReel?: string[];
  };
  availability?: string;
  shippingAddress?: {
    addressLine1: string;
    addressLine2: string;
    zipCode: string;
    country: string;
    city: string;
  };
  socialMedia: {
    platform: 'tiktok' | 'instagram' | 'youtube';
    userId: string;
    username?: string;
    followers?: number;
    engagementRate?: number;
    accessToken?: string;
    refreshToken?: string;
    likesCount?: number;
    tokenExpiresAt?: Date;
    shouldReconnect?: boolean;
    pageId?: string;
  }[];

  field?: string;
  spokenLanguages?: string[];
  failedAttempts: number;
  lockUntil?: Date | null;
  passKey?: string;
  otpCode?: string;
  bookmarkedCampaigns?: string[];
  activeSubscription?: string;
  remainingCampaigns?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    type: {
      type: String,
      required: true,
      enum: ['influencer', 'business', 'admin'],
    },
    provider: {
      type: String,
      required: true,
      enum: ['local', 'google', 'facebook'],
      default: 'local',
    },
    name: { type: String, required: true },
    username: { type: String },
    email: { type: String, required: true, unique: true, immutable: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['F', 'M'] },
    password: { type: String },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
    walletId: { type: String },
    phone: { type: String },
    secondPhone: { type: String },
    address: {
      country: { type: String },
      city: { type: String },
      timeZone: { type: String },
    },
    profilePicture: { type: String },
    bio: { type: String },
    description: { type: String },
    website: { type: String },
    primaryNiche: { type: String },
    secondaryNiches: { type: [String] },
    mainContentTypes: { type: String },
    brandTone: { type: String },
    previousCollaborations: { type: String },
    portfolio: { type: [String] },
    collaborationType: { type: String },
    preferredIndustry: { type: String },
    minimumRates: {
      perReel: { type: [String], default: ['', ''] },
      perCarousel: { type: [String], default: ['', ''] },
      perCarouselReel: { type: [String], default: ['', ''] },
    },
    availability: { type: String },
    shippingAddress: {
      addressLine1: { type: String },
      addressLine2: { type: String },
      zipCode: { type: String },
      country: { type: String },
      city: { type: String },
    },
    socialMedia: {
      type: [
        {
          platform: {
            type: String,
            required: true,
            enum: ['tiktok', 'instagram', 'youtube'],
          },
          userId: { type: String, required: true },
          username: { type: String },
          followers: { type: Number },
          engagementRate: { type: Number },
          accessToken: String,
          refreshToken: String,
          likesCount: Number,
          tokenExpiresAt: { type: Date },
          shouldReconnect: { type: Boolean, default: false },
          pageId: { type: String },
        },
      ],
      default: [],
    },
    spokenLanguages: {
      type: [String],
    },
    field: { type: String },
    failedAttempts: { type: Number, default: 0, required: true },
    lockUntil: { type: Date, default: null },
    verified: { type: Boolean, default: false },
    passKey: String,
    otpCode: String,
    // optional
    bookmarkedCampaigns: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Campaign' }],
      default: null,
      required: false,
    },
    activeSubscription: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
    remainingCampaigns: { type: Number, default: 2 },
  },
  { timestamps: true }
);
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ type: 1 });
UserSchema.index({ phone: 1 }, { sparse: true });
UserSchema.index({ field: 1 });
UserSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(10);
      if (!this.password) return next();
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err as CallbackError);
    }
  }
  next();
});

export default mongoose.models.User || model<IUser>('User', UserSchema);
