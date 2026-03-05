import mongoose, { Schema, Document } from 'mongoose';
import { Types } from 'mongoose';

export interface IMessage extends Document {
  chatRoom: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  read: boolean;
  type?: 'text' | 'negotiate' | 'negotiate_response';
  negotiation?: {
    price?: number;
    reason?: string;
    status?: 'pending' | 'accepted' | 'declined';
  };
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema(
  {
    chatRoom: {
      type: Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['text', 'negotiate', 'negotiate_response'],
      default: 'text',
    },
    negotiation: {
      price: {
        type: Number,
      },
      reason: {
        type: String,
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending',
      },
    },
  },
  {
    timestamps: true,
  }
);

const Message =
  mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;
