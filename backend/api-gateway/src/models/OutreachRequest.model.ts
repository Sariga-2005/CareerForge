import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOutreachRequest extends Document {
    _id: Types.ObjectId;
    studentId: Types.ObjectId;
    campaignId: Types.ObjectId;
    alumniId: Types.ObjectId;
    status: 'pending' | 'approved' | 'rejected' | 'sent';
    eligibilityScore: number;
    reason: string;
    createdAt: Date;
    updatedAt: Date;
}

const outreachRequestSchema = new Schema<IOutreachRequest>(
    {
        studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        campaignId: { type: Schema.Types.ObjectId, ref: 'OutreachCampaign', required: true },
        alumniId: { type: Schema.Types.ObjectId, ref: 'Alumni', required: true },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'sent'],
            default: 'pending',
        },
        eligibilityScore: { type: Number, default: 0, min: 0, max: 100 },
        reason: { type: String, default: '', maxlength: 500 },
    },
    { timestamps: true }
);

outreachRequestSchema.index({ studentId: 1, campaignId: 1 });

export const OutreachRequest = mongoose.model<IOutreachRequest>('OutreachRequest', outreachRequestSchema);
