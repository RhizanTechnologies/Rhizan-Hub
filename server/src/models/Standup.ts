import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStandup extends Document {
  user: Types.ObjectId;
  userName: string;
  userRole?: string;
  userAvatar?: string;
  date: Date;
  completedToday: string;
  prioritiesTomorrow: string;
  blockers?: string;
  hoursWorked?: number;
  createdAt: Date;
  updatedAt: Date;
}

const StandupSchema = new Schema<IStandup>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userRole: { type: String },
    userAvatar: { type: String },
    date: { type: Date, default: Date.now },
    completedToday: { type: String, required: true },
    prioritiesTomorrow: { type: String, required: true },
    blockers: { type: String, default: '' },
    hoursWorked: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Standup = mongoose.model<IStandup>('Standup', StandupSchema);
