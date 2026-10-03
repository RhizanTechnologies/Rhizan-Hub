import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'MEMBER';
  title: string; // e.g. "Development", "Business / Client", "Operations / Product"
  weeklyCapacityHours: number;
  status: 'ACTIVE' | 'AWAY' | 'OFFLINE';
  avatar?: string;
  mustChangePassword?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'MEMBER'], default: 'MEMBER' },
    title: { type: String, default: 'Team Member' },
    weeklyCapacityHours: { type: Number, default: 48 },
    status: { type: String, enum: ['ACTIVE', 'AWAY', 'OFFLINE'], default: 'ACTIVE' },
    avatar: { type: String, default: '' },
    mustChangePassword: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
