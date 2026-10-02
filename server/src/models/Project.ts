import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProjectResourceLink {
  _id?: Types.ObjectId;
  title: string;
  url: string;
  category?: string; // GITHUB, FIGMA, LIVE, STAGING, DOCS, DRIVE, OTHER
}

export interface IProjectDeliverable {
  _id?: Types.ObjectId;
  title: string;
  completed: boolean;
}

export interface IProjectMilestone {
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  deliverables?: IProjectDeliverable[];
  completedAt?: Date;
}

export interface IProject extends Document {
  name: string;
  clientName: string;
  clientId?: Types.ObjectId;
  description: string;
  lead?: Types.ObjectId;
  members: Types.ObjectId[];
  techStack?: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
  progress: number; // 0 to 100
  startDate?: Date;
  deadline?: Date;
  budget?: number;
  notes?: string;
  links: IProjectResourceLink[];
  milestones: IProjectMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectResourceLinkSchema = new Schema<IProjectResourceLink>(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    category: { type: String, default: 'OTHER' },
  },
  { timestamps: true }
);

const ProjectDeliverableSchema = new Schema<IProjectDeliverable>(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: false }
);

const ProjectMilestoneSchema = new Schema<IProjectMilestone>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    deliverables: [ProjectDeliverableSchema],
    completedAt: { type: Date },
  },
  { timestamps: true }
);

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    clientName: { type: String, default: 'Internal' },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
    description: { type: String, default: '' },
    lead: { type: Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    techStack: [{ type: String, trim: true }],
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
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
    links: [ProjectResourceLinkSchema],
    milestones: [ProjectMilestoneSchema],
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
