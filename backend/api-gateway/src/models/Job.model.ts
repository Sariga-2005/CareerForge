import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IJob extends Document {
  _id: Types.ObjectId;
  
  // Company info
  companyName: string;
  companyLogo?: string;
  companyDescription?: string;
  
  // Job details
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  
  // Classification
  type: 'full-time' | 'internship' | 'part-time' | 'contract';
  level: 'entry' | 'mid' | 'senior';
  department: string;
  
  // Skills
  requiredSkills: string[];
  preferredSkills?: string[];
  
  // Compensation
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: 'annual' | 'monthly' | 'hourly';
  };
  
  // Location
  location: string;
  isRemote: boolean;
  
  // Eligibility
  eligibility: {
    minCGPA?: number;
    departments?: string[];
    batches?: string[];
    backlogsAllowed?: boolean;
  };
  
  // Application
  applicationDeadline: Date;
  applicationLink?: string;
  
  // Status
  status: 'draft' | 'active' | 'closed' | 'filled';
  
  // Statistics
  stats: {
    views: number;
    applications: number;
    shortlisted: number;
    selected: number;
  };
  
  // Embeddings for matching
  embedding?: number[];
  
  // Alumni referral
  referralAvailable: boolean;
  referringAlumni?: mongoose.Types.ObjectId[];
  
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyLogo: String,
    companyDescription: String,
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: [{ type: String, required: true }],
    responsibilities: [{ type: String, required: true }],
    type: {
      type: String,
      required: true,
      enum: ['full-time', 'internship', 'part-time', 'contract'],
    },
    level: {
      type: String,
      required: true,
      enum: ['entry', 'mid', 'senior'],
    },
    department: {
      type: String,
      required: true,
    },
    requiredSkills: [{ type: String, required: true }],
    preferredSkills: [String],
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'INR' },
      period: { type: String, enum: ['annual', 'monthly', 'hourly'], default: 'annual' },
    },
    location: {
      type: String,
      required: true,
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    eligibility: {
      minCGPA: { type: Number, min: 0, max: 10 },
      departments: [String],
      batches: [String],
      backlogsAllowed: { type: Boolean, default: false },
    },
    applicationDeadline: {
      type: Date,
      required: true,
    },
    applicationLink: String,
    status: {
      type: String,
      enum: ['draft', 'active', 'closed', 'filled'],
      default: 'draft',
    },
    stats: {
      views: { type: Number, default: 0 },
      applications: { type: Number, default: 0 },
      shortlisted: { type: Number, default: 0 },
      selected: { type: Number, default: 0 },
    },
    embedding: [Number],
    referralAvailable: {
      type: Boolean,
      default: false,
    },
    referringAlumni: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
jobSchema.index({ status: 1, applicationDeadline: 1 });
jobSchema.index({ companyName: 'text', title: 'text', description: 'text' });
jobSchema.index({ requiredSkills: 1 });
jobSchema.index({ 'eligibility.departments': 1, 'eligibility.batches': 1 });

export const Job = mongoose.model<IJob>('Job', jobSchema);
