import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IJobApplication extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    jobId: Types.ObjectId;
    coverLetter: string;
    resumeId?: Types.ObjectId;
    githubLink?: string;
    linkedinLink?: string;
    portfolioLink?: string;
    skills?: string[];
    matchScore?: number;
    university?: string;
    degree?: string;
    cgpa?: number;
    phone?: string;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted' | 'forwarded_to_company';
    appliedAt: Date;
    updatedAt: Date;
}

const jobApplicationSchema = new Schema<IJobApplication>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
        coverLetter: { type: String, default: '', maxlength: 3000 },
        resumeId: { type: Schema.Types.ObjectId, ref: 'Resume' },
        githubLink: { type: String },
        linkedinLink: { type: String },
        portfolioLink: { type: String },
        skills: [{ type: String }],
        matchScore: { type: Number, min: 0, max: 100 },
        university: { type: String },
        degree: { type: String },
        cgpa: { type: Number },
        phone: { type: String },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted', 'forwarded_to_company'],
            default: 'pending',
        },
    },
    { timestamps: { createdAt: 'appliedAt', updatedAt: 'updatedAt' } }
);

jobApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const JobApplication = mongoose.model<IJobApplication>('JobApplication', jobApplicationSchema);
