import mongoose, { Schema, model, Document } from 'mongoose';

export interface IRefreshToken extends Document {
  token: string;
  user: string;
  expires: Date;
}
const RefreshTokenSchema = new Schema<IRefreshToken>({
  token: { type: String, required: true },
  user: { type: String, required: true },
  expires: { type: Date, required: true },
});
export default mongoose.models.RefreshToken ||
  model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
