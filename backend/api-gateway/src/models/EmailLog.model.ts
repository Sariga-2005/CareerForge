import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEmailLog extends Document {
    _id: Types.ObjectId;
    campaignId: Types.ObjectId;
    templateId: Types.ObjectId;
    senderId: Types.ObjectId;
    recipientAlumniId: Types.ObjectId;
    recipientEmail: string;
    subject: string;
    body: string;
    status: 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced';
    sentAt?: Date;
    openedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const emailLogSchema = new Schema<IEmailLog>(
    {
        campaignId: { type: Schema.Types.ObjectId, ref: 'OutreachCampaign', required: true },
        templateId: { type: Schema.Types.ObjectId, ref: 'EmailTemplate', required: true },
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        recipientAlumniId: { type: Schema.Types.ObjectId, ref: 'Alumni', required: true },
        recipientEmail: { type: String, required: true, lowercase: true, trim: true },
        subject: { type: String, required: true, trim: true },
        body: { type: String, required: true },
        status: {
            type: String,
            enum: ['queued', 'sent', 'delivered', 'failed', 'bounced'],
            default: 'queued',
        },
        sentAt: Date,
        openedAt: Date,
    },
    { timestamps: true }
);

emailLogSchema.index({ campaignId: 1, senderId: 1 });

export const EmailLog = mongoose.model<IEmailLog>('EmailLog', emailLogSchema);
