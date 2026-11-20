import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'CEO' | 'CTO' | 'COO' | 'ADMIN' | 'MEMBER';

export interface IPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt?: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  title: string; // e.g. "CEO", "CTO", "COO", "Development", "Business / Client", "Operations / Product"
  weeklyCapacityHours: number;
  status: 'ACTIVE' | 'AWAY' | 'OFFLINE';
  avatar?: string;
  mustChangePassword?: boolean;
  pushSubscriptions?: IPushSubscription[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['CEO', 'CTO', 'COO', 'ADMIN', 'MEMBER'], default: 'CEO' },
    title: { type: String, default: 'Founder' },
    weeklyCapacityHours: { type: Number, default: 48 },
    status: { type: String, enum: ['ACTIVE', 'AWAY', 'OFFLINE'], default: 'ACTIVE' },
    avatar: { type: String, default: '' },
    mustChangePassword: { type: Boolean, default: false },
    pushSubscriptions: [
      {
        endpoint: { type: String, required: true },
        keys: {
          p256dh: { type: String, required: true },
          auth: { type: String, required: true },
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
