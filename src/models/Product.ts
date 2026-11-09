import mongoose, { Schema } from 'mongoose';

export interface IProduct {
  name: string;
  price: number;
  description: string;
  image?: string;
  category: string;
  stock: number;
  rating: number;
  reviews: number;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: String,
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', productSchema);