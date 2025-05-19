import mongoose, { Schema, Document } from 'mongoose';

export interface IWhyChuolink extends Document {
  reasons: string[];
}

const WhyChuolinkSchema: Schema = new Schema(
  {
    reasons: [{ type: String, required: true }]
  },
  {
    timestamps: true
  }
);

export default mongoose.models.WhyChuolink ||
  mongoose.model<IWhyChuolink>('WhyChuolink', WhyChuolinkSchema);
