import mongoose, { Document, Schema } from 'mongoose';

export interface INiche extends Document {
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NicheSchema = new Schema<INiche>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    color: {
      type: String,
      default: '#0d9488',
    },
  },
  { timestamps: true }
);

export const Niche = mongoose.model<INiche>('Niche', NicheSchema);
