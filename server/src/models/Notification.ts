import mongoose, { Document, Schema, Types } from 'mongoose';

export type NotificationType =
  | 'OUTREACH_FOLLOWUP'
  | 'OUTREACH_ASSIGNED'
  | 'DEAL_WON'
  | 'TASK_ASSIGNED'
  | 'TASK_DUE'
  | 'TASK_REVIEW'
  | 'TASK_COMMENT'
  | 'WIP_LIMIT'
  | 'PROJECT_DEADLINE'
  | 'PROJECT_ASSIGNED'
  | 'MILESTONE_COMPLETED'
  | 'CLIENT_MEETING'
  | 'PAYMENT_DUE'
  | 'PAYMENT_RECEIVED'
  | 'STANDUP_REMINDER'
  | 'CAPACITY_ALERT'
  | 'SYSTEM';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  actor?: {
    id?: Types.ObjectId;
    name?: string;
  };
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  read: boolean;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  dedupKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actor: {
      id: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String },
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: '/',
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    dedupKey: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast user inbox queries
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
