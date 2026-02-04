import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IResume extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  
  // File information
  originalName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  fileData?: Buffer; // Store the actual file for re-analysis
  
  // Parsed data - stores full AI analysis
  parsedData?: any;
  
  // Skills extracted from resume
  skills?: {
    technical: string[];
    soft: string[];
  };
  
  // Analysis score
  analysisScore?: number;
  
  // AI Analysis
  analysis?: {
    overallScore: number;
    atsScore: number;
    skillScore: number;
    experienceScore: number;
    formatScore: number;
    
    strengths: string[];
    improvements: string[];
    
    skillGaps: Array<{
      skill: string;
      priority: 'high' | 'medium' | 'low';
      resources?: string[];
    }>;
    
    keywords: {
      present: string[];
      missing: string[];
    };
  };
  
  // Embeddings for vector search
  embedding?: number[];
  
  // Version control
  version: number;
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
      enum: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    },
    fileSize: {
      type: Number,
      required: true,
      max: 10 * 1024 * 1024, // 10MB max
    },
    fileData: {
      type: Buffer,
      select: false, // Don't include in queries by default to save bandwidth
    },
    parsedData: Schema.Types.Mixed,
    skills: {
      technical: [String],
      soft: [String],
    },
    analysisScore: { type: Number, min: 0, max: 100 },
    analysis: {
      overallScore: { type: Number, min: 0, max: 100 },
      atsScore: { type: Number, min: 0, max: 100 },
      skillScore: { type: Number, min: 0, max: 100 },
      experienceScore: { type: Number, min: 0, max: 100 },
      formatScore: { type: Number, min: 0, max: 100 },
      strengths: [String],
      improvements: [String],
      skillGaps: [{
        skill: String,
        priority: { type: String, enum: ['high', 'medium', 'low'] },
        resources: [String],
      }],
      keywords: {
        present: [String],
        missing: [String],
      },
    },
    embedding: [Number],
    version: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
resumeSchema.index({ userId: 1, isActive: 1 });
resumeSchema.index({ userId: 1, createdAt: -1 });

export const Resume = mongoose.model<IResume>('Resume', resumeSchema);
