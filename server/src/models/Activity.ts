import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IActivity extends Document {
  user: Types.ObjectId;
  userName: string;
  action: string; // e.g. "completed task", "added lead", "moved task to Review"
  entityType: 'TASK' | 'PROJECT' | 'CLIENT' | 'TIME';
  entityTitle: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    action: { type: String, required: true },
    entityType: {
      type: String,
      enum: ['TASK', 'PROJECT', 'CLIENT', 'TIME'],
      required: true,
    },
    entityTitle: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
