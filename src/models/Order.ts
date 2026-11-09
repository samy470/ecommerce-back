import mongoose, { Schema, Types } from 'mongoose';

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder {
  user: Types.ObjectId;
  items: IOrderItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress?: string;
  paymentMethod?: string;
}

const orderSchema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number
  }],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  shippingAddress: String,
  paymentMethod: String
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', orderSchema);