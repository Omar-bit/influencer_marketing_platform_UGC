import mongoose, { Document, Schema, model } from 'mongoose';

export interface ITicket extends Document {
  user: Schema.Types.ObjectId;
  type: 'question' | 'feedback' | 'bug' | 'feature' | 'other';
  title: string;
  description: string;
  status: 'pending' | 'inProgress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  adminResponse?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      required: true,
      enum: ['question', 'feedback', 'bug', 'feature', 'other'],
      default: 'question',
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'inProgress', 'resolved'],
      default: 'pending',
    },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    adminResponse: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Create indexes for better query performance
TicketSchema.index({ user: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ read: 1 });
TicketSchema.index({ type: 1 });

export default mongoose.models.Ticket ||
  mongoose.model<ITicket>('Ticket', TicketSchema);
