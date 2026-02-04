import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IInterview extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  
  // Interview metadata
  type: 'technical' | 'hr' | 'behavioral' | 'system-design';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in minutes
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  
  // Target job/role
  targetRole?: string;
  targetCompany?: string;
  
  // Questions and responses
  questions: Array<{
    id: string;
    text: string;
    category: string;
    difficulty: string;
    timeLimit?: number;
    response?: {
      transcript: string;
      audioPath?: string;
      duration: number;
      timestamp: Date;
    };
    evaluation?: {
      score: number;
      feedback: string;
      strengths: string[];
      improvements: string[];
    };
  }>;
  
  // Real-time metrics
  metrics?: {
    nervousnessLevels: Array<{ timestamp: Date; value: number }>;
    confidenceScore: number;
    clarityScore: number;
    relevanceScore: number;
    technicalAccuracy?: number;
  };
  
  // Overall evaluation
  overallEvaluation?: {
    totalScore: number;
    grade: string;
    summary: string;
    strongAreas: string[];
    weakAreas: string[];
    recommendations: string[];
    hiringRecommendation: 'strong-yes' | 'yes' | 'maybe' | 'no' | 'strong-no';
  };
  
  // Recording
  recordingPath?: string;
  
  // Timing
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const interviewSchema = new Schema<IInterview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['technical', 'hr', 'behavioral', 'system-design'],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard'],
    },
    duration: {
      type: Number,
      required: true,
      min: 5,
      max: 120,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    targetRole: String,
    targetCompany: String,
    questions: [{
      id: { type: String, required: true },
      text: { type: String, required: true },
      category: String,
      difficulty: String,
      timeLimit: Number,
      response: {
        transcript: String,
        audioPath: String,
        duration: Number,
        timestamp: Date,
      },
      evaluation: {
        score: { type: Number, min: 0, max: 100 },
        feedback: String,
        strengths: [String],
        improvements: [String],
      },
    }],
    metrics: {
      nervousnessLevels: [{ timestamp: Date, value: Number }],
      confidenceScore: { type: Number, min: 0, max: 100 },
      clarityScore: { type: Number, min: 0, max: 100 },
      relevanceScore: { type: Number, min: 0, max: 100 },
      technicalAccuracy: { type: Number, min: 0, max: 100 },
    },
    overallEvaluation: {
      totalScore: { type: Number, min: 0, max: 100 },
      grade: String,
      summary: String,
      strongAreas: [String],
      weakAreas: [String],
      recommendations: [String],
      hiringRecommendation: {
        type: String,
        enum: ['strong-yes', 'yes', 'maybe', 'no', 'strong-no'],
      },
    },
    recordingPath: String,
    scheduledAt: Date,
    startedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
interviewSchema.index({ userId: 1, status: 1 });
interviewSchema.index({ userId: 1, createdAt: -1 });
interviewSchema.index({ type: 1, status: 1 });

export const Interview = mongoose.model<IInterview>('Interview', interviewSchema);
