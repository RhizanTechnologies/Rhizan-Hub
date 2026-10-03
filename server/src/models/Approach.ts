import mongoose, { Document, Schema, Types } from 'mongoose';

export type ApproachStatus =
  | 'PROSPECT'
  | 'CONTACTED'
  | 'PITCHED'
  | 'IN_DISCUSSION'
  | 'DEAL_WON'
  | 'NOT_INTERESTED';

export type ContactChannel = 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING' | 'OTHER';

export interface IContactHistory {
  _id?: Types.ObjectId;
  date: Date;
  channel: ContactChannel;
  notes: string;
  nextFollowUpDate?: Date;
  loggedBy?: Types.ObjectId;
  createdAt?: Date;
}

export interface IApproach extends Document {
  businessName: string;
  niche: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  location?: string;
  status: ApproachStatus;
  notes?: string;
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
  contactHistory: IContactHistory[];
  assignedTo?: Types.ObjectId;
  convertedClientId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContactHistorySchema = new Schema(
  {
    date: { type: Date, required: true, default: Date.now },
    channel: {
      type: String,
      enum: ['CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'OTHER'],
      default: 'CALL',
    },
    notes: { type: String, required: true, trim: true },
    nextFollowUpDate: { type: Date },
    loggedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const ApproachSchema = new Schema<IApproach>(
  {
    businessName: { type: String, required: true, trim: true },
    niche: { type: String, required: true, trim: true, default: 'General' },
    contactPerson: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    location: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PROSPECT', 'CONTACTED', 'PITCHED', 'IN_DISCUSSION', 'DEAL_WON', 'NOT_INTERESTED'],
      default: 'PROSPECT',
    },
    notes: { type: String, default: '' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    lastContactDate: { type: Date },
    nextFollowUpDate: { type: Date },
    contactHistory: [ContactHistorySchema],
    convertedClientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  },
  { timestamps: true }
);

export const Approach = mongoose.model<IApproach>('Approach', ApproachSchema);

