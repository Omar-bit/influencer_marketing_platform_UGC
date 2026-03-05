import mongoose, { Schema, model, Document } from 'mongoose';
import { IUser } from './user';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  images: {
    file: string;
    three: string;
  }[];
  brand: Schema.Types.ObjectId;
  category: string;
  status: 'active' | 'inactive';
  stock: number;
  specifications: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [
      {
        type: {
          file: String,
          three: String,
        },
        required: true,
      },
    ],
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    specifications: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
productSchema.index({ brand: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });

export const Product =
  mongoose.models.Product || model<IProduct>('Product', productSchema);
