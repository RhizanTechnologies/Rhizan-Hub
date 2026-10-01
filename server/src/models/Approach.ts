import mongoose, { Document, Schema, Types } from 'mongoose';

export type ApproachStatus =
  | 'PROSPECT'
  | 'CONTACTED'
  | 'PITCHED'
  | 'IN_DISCUSSION'
  | 'DEAL_WON'
  | 'NOT_INTERESTED';

export interface IApproach extends Document {
  businessName: string;
  niche: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  location?: string;
  status: ApproachStatus;
  notes?: string;
  convertedClientId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

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
    convertedClientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  },
  { timestamps: true }
);

export const Approach = mongoose.model<IApproach>('Approach', ApproachSchema);
