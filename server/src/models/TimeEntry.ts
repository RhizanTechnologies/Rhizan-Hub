import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITimeEntry extends Document {
  user: Types.ObjectId;
  project: Types.ObjectId;
  task?: Types.ObjectId;
  description: string;
  date: Date;
  hours: number;
  minutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const TimeEntrySchema = new Schema<ITimeEntry>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    task: { type: Schema.Types.ObjectId, ref: 'Task' },
    description: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    hours: { type: Number, default: 0, min: 0 },
    minutes: { type: Number, default: 0, min: 0, max: 59 },
  },
  { timestamps: true }
);

export const TimeEntry = mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);
