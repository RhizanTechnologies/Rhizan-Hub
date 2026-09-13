import mongoose, { Document, Schema, Types } from 'mongoose';

export type ClientStatus =
  | 'LEAD'
  | 'CONTACTED'
  | 'MEETING'
  | 'PROPOSAL'
  | 'ACTIVE'
  | 'COMPLETED';

export interface IClient extends Document {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: ClientStatus;
  serviceInterested: string;
  assignedTo?: Types.ObjectId;
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
  notes: string;
  dealValue?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    status: {
      type: String,
      enum: ['LEAD', 'CONTACTED', 'MEETING', 'PROPOSAL', 'ACTIVE', 'COMPLETED'],
      default: 'LEAD',
    },
    serviceInterested: { type: String, default: 'Custom Software / ERP' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    lastContactDate: { type: Date },
    nextFollowUpDate: { type: Date },
    notes: { type: String, default: '' },
    dealValue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Client = mongoose.model<IClient>('Client', ClientSchema);
