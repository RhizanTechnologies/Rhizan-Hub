import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProject extends Document {
  name: string;
  clientName: string;
  description: string;
  members: Types.ObjectId[];
  status: 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
  progress: number; // 0 to 100
  startDate?: Date;
  deadline?: Date;
  budget?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    clientName: { type: String, default: 'Internal' },
    description: { type: String, default: '' },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'],
      default: 'IN_PROGRESS',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    startDate: { type: Date },
    deadline: { type: Date },
    budget: { type: Number },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
