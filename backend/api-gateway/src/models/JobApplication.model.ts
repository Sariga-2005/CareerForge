import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IJobApplication extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    jobId: Types.ObjectId;
    coverLetter: string;
    resumeId?: Types.ObjectId;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
    appliedAt: Date;
    updatedAt: Date;
}

const jobApplicationSchema = new Schema<IJobApplication>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
        coverLetter: { type: String, default: '', maxlength: 3000 },
        resumeId: { type: Schema.Types.ObjectId, ref: 'Resume' },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
            default: 'pending',
        },
    },
    { timestamps: { createdAt: 'appliedAt', updatedAt: 'updatedAt' } }
);

jobApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const JobApplication = mongoose.model<IJobApplication>('JobApplication', jobApplicationSchema);
