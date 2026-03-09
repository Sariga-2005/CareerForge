import { Response, NextFunction } from 'express';
import { OutreachCampaign, EmailTemplate } from '../models/Headhunter.model';
import { Alumni } from '../models/Alumni.model';
import { OutreachRequest } from '../models/OutreachRequest.model';
import { EmailLog } from '../models/EmailLog.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

export class HeadhunterController {
    // ═══════════════════  OUTREACH CAMPAIGNS  ═══════════════════

    getAllCampaigns = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { search } = req.query;
            const query: any = { userId: req.userId };
            if (search) query.campaignName = { $regex: search, $options: 'i' };

            const campaigns = await OutreachCampaign.find(query).sort({ createdAt: -1 });
            res.json({ success: true, data: campaigns });
        } catch (error: any) {
            logger.error('[Headhunter] Error fetching campaigns:', error.message);
            next(error);
        }
    };

    getCampaignById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const campaign = await OutreachCampaign.findOne({ _id: req.params.id, userId: req.userId });
            if (!campaign) { res.status(404).json({ success: false, message: 'Campaign not found' }); return; }
            res.json({ success: true, data: campaign });
        } catch (error: any) {
            logger.error('[Headhunter] Error fetching campaign:', error.message);
            next(error);
        }
    };

    createCampaign = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const campaign = await OutreachCampaign.create({ ...req.body, userId: req.userId });
            logger.info(`[Headhunter] Campaign created: ${campaign.campaignName} by user ${req.userId}`);
            res.status(201).json({ success: true, data: campaign, message: 'Campaign created successfully' });
        } catch (error: any) {
            logger.error('[Headhunter] Error creating campaign:', error.message);
            next(error);
        }
    };

    updateCampaign = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const campaign = await OutreachCampaign.findOneAndUpdate(
                { _id: req.params.id, userId: req.userId },
                { $set: req.body },
                { new: true, runValidators: true }
            );
            if (!campaign) { res.status(404).json({ success: false, message: 'Campaign not found' }); return; }
            logger.info(`[Headhunter] Campaign updated: ${campaign.campaignName}`);
            res.json({ success: true, data: campaign, message: 'Campaign updated successfully' });
        } catch (error: any) {
            logger.error('[Headhunter] Error updating campaign:', error.message);
            next(error);
        }
    };

    deleteCampaign = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const campaign = await OutreachCampaign.findOneAndDelete({ _id: req.params.id, userId: req.userId });
            if (!campaign) { res.status(404).json({ success: false, message: 'Campaign not found' }); return; }
            logger.info(`[Headhunter] Campaign deleted: ${campaign.campaignName}`);
            res.json({ success: true, message: 'Campaign deleted successfully' });
        } catch (error: any) {
            logger.error('[Headhunter] Error deleting campaign:', error.message);
            next(error);
        }
    };

    // ═══════════════════  EMAIL TEMPLATES  ═══════════════════

    getAllTemplates = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { search } = req.query;
            const query: any = { userId: req.userId };
            if (search) query.templateName = { $regex: search, $options: 'i' };

            const templates = await EmailTemplate.find(query).sort({ createdAt: -1 });
            res.json({ success: true, data: templates });
        } catch (error: any) {
            logger.error('[Headhunter] Error fetching templates:', error.message);
            next(error);
        }
    };

    getTemplateById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const template = await EmailTemplate.findOne({ _id: req.params.id, userId: req.userId });
            if (!template) { res.status(404).json({ success: false, message: 'Template not found' }); return; }
            res.json({ success: true, data: template });
        } catch (error: any) {
            logger.error('[Headhunter] Error fetching template:', error.message);
            next(error);
        }
    };

    createTemplate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const template = await EmailTemplate.create({ ...req.body, userId: req.userId });
            logger.info(`[Headhunter] Template created: ${template.templateName} by user ${req.userId}`);
            res.status(201).json({ success: true, data: template, message: 'Template created successfully' });
        } catch (error: any) {
            logger.error('[Headhunter] Error creating template:', error.message);
            next(error);
        }
    };

    updateTemplate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const template = await EmailTemplate.findOneAndUpdate(
                { _id: req.params.id, userId: req.userId },
                { $set: req.body },
                { new: true, runValidators: true }
            );
            if (!template) { res.status(404).json({ success: false, message: 'Template not found' }); return; }
            logger.info(`[Headhunter] Template updated: ${template.templateName}`);
            res.json({ success: true, data: template, message: 'Template updated successfully' });
        } catch (error: any) {
            logger.error('[Headhunter] Error updating template:', error.message);
            next(error);
        }
    };

    deleteTemplate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const template = await EmailTemplate.findOneAndDelete({ _id: req.params.id, userId: req.userId });
            if (!template) { res.status(404).json({ success: false, message: 'Template not found' }); return; }
            logger.info(`[Headhunter] Template deleted: ${template.templateName}`);
            res.json({ success: true, message: 'Template deleted successfully' });
        } catch (error: any) {
            logger.error('[Headhunter] Error deleting template:', error.message);
            next(error);
        }
    };
    // ═══════════════════  RUN CAMPAIGN  ═══════════════════

    runCampaign = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const campaign = await OutreachCampaign.findOne({ _id: req.params.id, userId: req.userId });
            if (!campaign) { res.status(404).json({ success: false, message: 'Campaign not found' }); return; }
            if (!campaign.isActive) { res.status(400).json({ success: false, message: 'Campaign is not active' }); return; }
            if (!campaign.consentGiven) { res.status(400).json({ success: false, message: 'Consent not given for this campaign' }); return; }

            // Pick a template (prefer default, else first available)
            const templateId = req.body.templateId;
            let template;
            if (templateId) {
                template = await EmailTemplate.findOne({ _id: templateId, userId: req.userId });
            } else {
                template = await EmailTemplate.findOne({ userId: req.userId, isDefault: true })
                    || await EmailTemplate.findOne({ userId: req.userId });
            }
            if (!template) { res.status(400).json({ success: false, message: 'No email template found. Please create one first.' }); return; }

            // Find matching alumni based on campaign targeting
            const alumniQuery: any = { isActive: true };
            if (campaign.targetIndustry) {
                alumniQuery.currentCompany = { $regex: campaign.targetIndustry, $options: 'i' };
            }
            if (campaign.targetAlumniLevel) {
                alumniQuery.currentDesignation = { $regex: campaign.targetAlumniLevel, $options: 'i' };
            }

            const matchedAlumni = await Alumni.find(alumniQuery).limit(campaign.maxEmailsPerWeek);

            if (matchedAlumni.length === 0) {
                res.json({ success: true, message: 'No matching alumni found for this campaign criteria.', data: { emailsSent: 0, alumni: [] } });
                return;
            }

            // Create outreach requests and email logs
            const results = [];
            for (const alumni of matchedAlumni) {
                // Check if outreach already exists
                const existingRequest = await OutreachRequest.findOne({
                    studentId: req.userId,
                    campaignId: campaign._id,
                    alumniId: alumni._id,
                });
                if (existingRequest) continue;

                // Create outreach request
                const outreachRequest = await OutreachRequest.create({
                    studentId: req.userId,
                    campaignId: campaign._id,
                    alumniId: alumni._id,
                    status: 'sent',
                    eligibilityScore: 80,
                    reason: `Auto-matched via campaign: ${campaign.campaignName}`,
                });

                // Create email log
                const personalizedSubject = template.subject.replace('{{alumni_name}}', `${alumni.firstName} ${alumni.lastName}`);
                const personalizedBody = template.body
                    .replace('{{alumni_name}}', `${alumni.firstName} ${alumni.lastName}`)
                    .replace('{{company}}', alumni.currentCompany || 'your company')
                    .replace('{{designation}}', alumni.currentDesignation || '');

                const emailLog = await EmailLog.create({
                    campaignId: campaign._id,
                    templateId: template._id,
                    senderId: req.userId,
                    recipientAlumniId: alumni._id,
                    recipientEmail: alumni.email,
                    subject: personalizedSubject,
                    body: personalizedBody,
                    status: 'sent',
                    sentAt: new Date(),
                });

                results.push({
                    alumniName: `${alumni.firstName} ${alumni.lastName}`,
                    alumniEmail: alumni.email,
                    company: alumni.currentCompany,
                    designation: alumni.currentDesignation,
                    outreachRequestId: outreachRequest._id,
                    emailLogId: emailLog._id,
                    status: 'sent',
                });
            }

            logger.info(`[Headhunter] Campaign "${campaign.campaignName}" executed: ${results.length} emails sent by user ${req.userId}`);

            res.json({
                success: true,
                message: `Campaign executed successfully! ${results.length} outreach emails sent.`,
                data: {
                    campaignName: campaign.campaignName,
                    emailsSent: results.length,
                    alumni: results,
                },
            });
        } catch (error: any) {
            logger.error('[Headhunter] Error running campaign:', error.message);
            next(error);
        }
    };
}

export const headhunterController = new HeadhunterController();
