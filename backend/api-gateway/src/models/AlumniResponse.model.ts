import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAlumniResponse extends Document {
    _id: Types.ObjectId;
    emailLogId: Types.ObjectId;
    alumniId: Types.ObjectId;
    studentId: Types.ObjectId;
    responseType: 'positive' | 'negative' | 'neutral' | 'referral_offered';
    message: string;
    referralConfirmed: boolean;
    respondedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const alumniResponseSchema = new Schema<IAlumniResponse>(
    {
        emailLogId: { type: Schema.Types.ObjectId, ref: 'EmailLog', required: true },
        alumniId: { type: Schema.Types.ObjectId, ref: 'Alumni', required: true, index: true },
        studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        responseType: {
            type: String,
            enum: ['positive', 'negative', 'neutral', 'referral_offered'],
            default: 'neutral',
        },
        message: { type: String, default: '', maxlength: 2000 },
        referralConfirmed: { type: Boolean, default: false },
        respondedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

alumniResponseSchema.index({ alumniId: 1, studentId: 1 });

export const AlumniResponse = mongoose.model<IAlumniResponse>('AlumniResponse', alumniResponseSchema);
