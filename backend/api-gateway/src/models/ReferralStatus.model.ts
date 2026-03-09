import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReferralStatus extends Document {
    _id: Types.ObjectId;
    studentId: Types.ObjectId;
    alumniId: Types.ObjectId;
    jobId?: Types.ObjectId;
    alumniResponseId: Types.ObjectId;
    status: 'pending' | 'referred' | 'interview_scheduled' | 'hired' | 'declined';
    referralDate?: Date;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}

const referralStatusSchema = new Schema<IReferralStatus>(
    {
        studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        alumniId: { type: Schema.Types.ObjectId, ref: 'Alumni', required: true, index: true },
        jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
        alumniResponseId: { type: Schema.Types.ObjectId, ref: 'AlumniResponse', required: true },
        status: {
            type: String,
            enum: ['pending', 'referred', 'interview_scheduled', 'hired', 'declined'],
            default: 'pending',
        },
        referralDate: Date,
        notes: { type: String, default: '', maxlength: 1000 },
    },
    { timestamps: true }
);

referralStatusSchema.index({ studentId: 1, alumniId: 1 });

export const ReferralStatus = mongoose.model<IReferralStatus>('ReferralStatus', referralStatusSchema);
