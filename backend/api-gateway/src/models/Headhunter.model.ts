import mongoose, { Document, Schema, Types } from 'mongoose';

// ─── Outreach Campaign ────────────────────────────────────────────
export interface IOutreachCampaign extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    campaignName: string;
    targetCompanyType: string;
    targetAlumniLevel: string;
    targetIndustry: string;
    maxEmailsPerWeek: number;
    priority: 'low' | 'medium' | 'high';
    consentGiven: boolean;
    isActive: boolean;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}

const outreachCampaignSchema = new Schema<IOutreachCampaign>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        campaignName: { type: String, required: [true, 'Campaign name is required'], trim: true, maxlength: 100 },
        targetCompanyType: { type: String, required: true, trim: true },
        targetAlumniLevel: { type: String, required: true, trim: true },
        targetIndustry: { type: String, required: true, trim: true },
        maxEmailsPerWeek: { type: Number, default: 5, min: 1, max: 20 },
        priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        consentGiven: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        notes: { type: String, default: '', maxlength: 500 },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

outreachCampaignSchema.index({ userId: 1, campaignName: 1 });

export const OutreachCampaign = mongoose.model<IOutreachCampaign>('OutreachCampaign', outreachCampaignSchema);

// ─── Email Template ───────────────────────────────────────────────
export interface IEmailTemplate extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    templateName: string;
    subject: string;
    body: string;
    signature: string;
    portfolioLabel: string;
    portfolioUrl: string;
    tone: 'formal' | 'semi-formal' | 'casual';
    isDefault: boolean;
    category: 'outreach' | 'follow-up' | 'thank-you' | 'referral';
    createdAt: Date;
    updatedAt: Date;
}

const emailTemplateSchema = new Schema<IEmailTemplate>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        templateName: { type: String, required: [true, 'Template name is required'], trim: true, maxlength: 100 },
        subject: { type: String, required: [true, 'Subject is required'], trim: true, maxlength: 200 },
        body: { type: String, required: [true, 'Email body is required'], maxlength: 5000 },
        signature: { type: String, default: '', maxlength: 1000 },
        portfolioLabel: { type: String, default: '', trim: true },
        portfolioUrl: { type: String, default: '', trim: true },
        tone: { type: String, enum: ['formal', 'semi-formal', 'casual'], default: 'formal' },
        isDefault: { type: Boolean, default: false },
        category: { type: String, enum: ['outreach', 'follow-up', 'thank-you', 'referral'], default: 'outreach' },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

emailTemplateSchema.index({ userId: 1, templateName: 1 });

export const EmailTemplate = mongoose.model<IEmailTemplate>('EmailTemplate', emailTemplateSchema);
