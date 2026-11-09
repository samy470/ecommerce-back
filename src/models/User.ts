import mongoose, { Schema } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  isAdmin: boolean;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  address: String,
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);