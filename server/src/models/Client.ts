import mongoose, { Document, Schema, Types } from 'mongoose';

export type ClientStatus =
  | 'LEAD'
  | 'CONTACTED'
  | 'MEETING'
  | 'PROPOSAL'
  | 'ACTIVE'
  | 'COMPLETED';

export interface IClientMeeting {
  _id?: Types.ObjectId;
  title: string;
  date: Date;
  time?: string;
  linkOrLocation?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface IClientPayment {
  _id?: Types.ObjectId;
  invoiceNumber?: string;
  title: string;
  amount: number;
  dueDate?: Date;
  paidDate?: Date;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  notes?: string;
}

export interface IResourceLink {
  _id?: Types.ObjectId;
  title: string;
  url: string;
  category?: string;
}

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
  dealValue: number;
  paidAmount: number;
  currency: string;
  projects: Types.ObjectId[];
  meetings: IClientMeeting[];
  payments: IClientPayment[];
  links: IResourceLink[];
  createdAt: Date;
  updatedAt: Date;
}

const ClientMeetingSchema = new Schema<IClientMeeting>(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, default: '' },
    linkOrLocation: { type: String, default: '' },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const ClientPaymentSchema = new Schema<IClientPayment>(
  {
    invoiceNumber: { type: String, default: '' },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date },
    paidDate: { type: Date },
    status: {
      type: String,
      enum: ['PAID', 'PENDING', 'OVERDUE'],
      default: 'PENDING',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const ResourceLinkSchema = new Schema<IResourceLink>(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    category: { type: String, default: 'OTHER' },
  },
  { timestamps: true }
);

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    status: {
      type: String,
      enum: ['LEAD', 'CONTACTED', 'MEETING', 'PROPOSAL', 'ACTIVE', 'COMPLETED'],
      default: 'ACTIVE',
    },
    serviceInterested: { type: String, default: 'Custom Software / ERP' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    lastContactDate: { type: Date },
    nextFollowUpDate: { type: Date },
    notes: { type: String, default: '' },
    dealValue: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    meetings: [ClientMeetingSchema],
    payments: [ClientPaymentSchema],
    links: [ResourceLinkSchema],
  },
  { timestamps: true }
);

export const Client = mongoose.model<IClient>('Client', ClientSchema);
