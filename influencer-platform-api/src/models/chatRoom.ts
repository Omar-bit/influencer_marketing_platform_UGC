import mongoose, { Schema, Document } from 'mongoose';
import { Types } from 'mongoose';

export interface IChatRoom extends Document {
  campaign: Types.ObjectId;
  brand: Types.ObjectId;
  influencer: Types.ObjectId;
  application: Types.ObjectId;
  lastMessage?: string;
  lastMessageTimestamp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const chatRoomSchema = new Schema(
  {
    campaign: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    influencer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    application: {
      type: Schema.Types.ObjectId,
      ref: 'InfluencerApplication',
      required: true,
    },
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageTimestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const ChatRoom =
  mongoose.models.ChatRoom || mongoose.model('ChatRoom', chatRoomSchema);

export default ChatRoom;
