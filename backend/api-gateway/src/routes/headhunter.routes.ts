import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { headhunterController } from '../controllers/headhunter.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Outreach Campaigns ───────────────────────────────────────────
router.get('/campaigns', headhunterController.getAllCampaigns);
router.get('/campaigns/:id', headhunterController.getCampaignById);
router.post('/campaigns', headhunterController.createCampaign);
router.put('/campaigns/:id', headhunterController.updateCampaign);
router.delete('/campaigns/:id', headhunterController.deleteCampaign);

// ─── Email Templates ──────────────────────────────────────────────
router.get('/templates', headhunterController.getAllTemplates);
router.get('/templates/:id', headhunterController.getTemplateById);
router.post('/templates', headhunterController.createTemplate);
router.put('/templates/:id', headhunterController.updateTemplate);
router.delete('/templates/:id', headhunterController.deleteTemplate);

export default router;
