import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITimeEntry extends Document {
  user: Types.ObjectId;
  project: Types.ObjectId;
  task?: Types.ObjectId;
  description: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  hours: number;
  minutes: number;
  billable: boolean;
  tag?: string;
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
    startTime: { type: String },
    endTime: { type: String },
    hours: { type: Number, default: 0, min: 0 },
    minutes: { type: Number, default: 0, min: 0, max: 59 },
    billable: { type: Boolean, default: true },
    tag: { type: String, default: 'Development' },
  },
  { timestamps: true }
);

export const TimeEntry = mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);
