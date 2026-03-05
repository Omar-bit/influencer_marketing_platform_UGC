import mongoose, { Schema, model, Document } from 'mongoose';

export interface IReport extends Document {
  user: Schema.Types.ObjectId;
  title: string;
  description: string;
  createdAt: Date;
}

const reportSchema = new Schema<IReport>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Report || model<IReport>('Report', reportSchema);
