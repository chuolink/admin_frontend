import mongoose, { Schema, Document } from 'mongoose';

export interface ICountry extends Document {
  name: string;
  slug: string;
  imgs: Array<{
    image: string;
    name: string;
  }>;
  description: string;
  benefits: Array<{
    title: string;
    description: string;
    img: string;
  }>;
  faqs: Array<{
    title: string;
    paragraphs: string[];
  }>;
  testimonials: Array<{
    name: string;
    subtitle: string;
    img: string;
    description: string;
    ratings: number;
  }>;
  reasons: string[];
}

const CountrySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    imgs: [
      {
        image: { type: String, required: true },
        name: { type: String, required: true }
      }
    ],
    description: { type: String, required: true },
    benefits: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        img: { type: String, required: true }
      }
    ],
    faqs: [
      {
        title: { type: String, required: true },
        paragraphs: [{ type: String, required: true }]
      }
    ],
    testimonials: [
      {
        name: { type: String, required: true },
        subtitle: { type: String, required: true },
        img: { type: String, required: true },
        description: { type: String, required: true },
        ratings: { type: Number, required: true, min: 1, max: 5 }
      }
    ],
    reasons: [{ type: String, required: true }]
  },
  {
    timestamps: true
  }
);

// Create indexes
CountrySchema.index({ slug: 1 }, { unique: true });
CountrySchema.index({ name: 1 });

export default mongoose.models.Country ||
  mongoose.model<ICountry>('Country', CountrySchema);
