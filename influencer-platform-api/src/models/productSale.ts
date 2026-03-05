import mongoose, { Schema, model, Document } from 'mongoose';

export interface IProductSale extends Document {
  product: Schema.Types.ObjectId;
  buyer: {
    email: string;
    name?: string;
  };
  amount: number;
  paymentRef: string;
  status: 'pending' | 'completed' | 'failed';
  influencer?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSaleSchema = new Schema<IProductSale>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    buyer: {
      email: {
        type: String,
        required: true,
      },
      name: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentRef: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    influencer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ProductSaleSchema.index({ product: 1 });
ProductSaleSchema.index({ paymentRef: 1 });
ProductSaleSchema.index({ status: 1 });

export default mongoose.models.ProductSale ||
  mongoose.model<IProductSale>('ProductSale', ProductSaleSchema);
