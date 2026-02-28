import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPlacementPrediction extends Document {
    _id: Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    studentName: string;
    email: string;
    department: string;
    batch: string;
    cgpa: number;
    resumeScore: number;
    interviewScore: number;
    skillCount: number;
    placementProbability: number;       // 0–100%
    riskLevel: 'High' | 'Medium' | 'Low';
    predictedPackage: number;           // LPA estimate
    recommendations: string;
    lastCalculated: Date;
    createdAt: Date;
    updatedAt: Date;
}

const placementPredictionSchema = new Schema<IPlacementPrediction>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student ID is required'],
            index: true,
        },
        studentName: {
            type: String,
            required: [true, 'Student name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
        },
        department: {
            type: String,
            required: [true, 'Department is required'],
            enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'],
        },
        batch: {
            type: String,
            required: [true, 'Batch is required'],
            trim: true,
        },
        cgpa: {
            type: Number,
            required: true,
            min: 0,
            max: 10,
            default: 0,
        },
        resumeScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        interviewScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        skillCount: {
            type: Number,
            min: 0,
            default: 0,
        },
        placementProbability: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        riskLevel: {
            type: String,
            required: true,
            enum: ['High', 'Medium', 'Low'],
        },
        predictedPackage: {
            type: Number,
            min: 0,
            default: 0,
        },
        recommendations: {
            type: String,
            trim: true,
            default: '',
        },
        lastCalculated: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

placementPredictionSchema.index({ department: 1, batch: 1 });
placementPredictionSchema.index({ placementProbability: 1 });
placementPredictionSchema.index({ email: 1 });

export const PlacementPrediction = mongoose.model<IPlacementPrediction>(
    'PlacementPrediction',
    placementPredictionSchema
);
