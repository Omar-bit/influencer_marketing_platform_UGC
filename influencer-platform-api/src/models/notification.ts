import mongoose, { Document, Schema, model } from 'mongoose';
export interface INotification extends Document {
  user: Schema.Types.ObjectId;
  title: string;
  body: string;
  read: boolean;
  type: 'system' | 'campaign' | 'payment';
  createdAt: Date;
  updatedAt: Date;
}
const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
    type: {
      type: String,
      required: true,
      enum: ['system', 'campaign', 'payment'],
      default: 'system',
    },
  },
  { timestamps: true }
);
NotificationSchema.index({ user: 1 });

export default mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);
