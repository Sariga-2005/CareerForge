import { Response, NextFunction } from 'express';
import { OutreachCampaign, EmailTemplate } from '../models/Headhunter.model';
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
}

export const headhunterController = new HeadhunterController();
