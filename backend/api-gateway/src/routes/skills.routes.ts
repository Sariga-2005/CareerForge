import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { aiRateLimiter } from '../middlewares/rateLimiter';
import { logger } from '../utils/logger';

const router = Router();

// AI Brain service URL
const AI_BRAIN_URL = process.env.AI_BRAIN_URL || 'http://localhost:5001';

// All routes require authentication
router.use(authenticate);

// Generate AI-powered learning roadmap
router.post('/ai-roadmap', aiRateLimiter, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { current_skills, target_role, timeframe_months } = req.body;

    logger.info(`[Skills Roadmap] Request for role: ${target_role}, skills: ${current_skills?.length} items`);

    if (!current_skills || !target_role) {
      return res.status(400).json({
        success: false,
        error: 'Current skills and target role are required'
      });
    }

    const url = `${AI_BRAIN_URL}/skills/ai-roadmap`;
    logger.info(`[Skills Roadmap] Calling AI Brain at: ${url}`);

    // Call AI Brain service
    const response = await axios.post(url, {
      current_skills,
      target_role,
      timeframe_months: timeframe_months || 6
    }, {
      timeout: 60000 // 60 second timeout for AI processing
    });

    logger.info(`[Skills Roadmap] AI Brain response success: ${response.data?.success}`);
    return res.json(response.data);
  } catch (error: any) {
    logger.error(`[Skills Roadmap] Error: ${error.message}`);
    logger.error(`[Skills Roadmap] Error code: ${error.code}`);
    logger.error(`[Skills Roadmap] Response data: ${JSON.stringify(error.response?.data)}`);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'AI service is currently unavailable. Please make sure AI Brain is running on port 5001.'
      });
    }

    return res.status(500).json({
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to generate roadmap'
    });
  }
});

// Get AI skill analysis
router.post('/ai-analyze', aiRateLimiter, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { skills, target_role, experience } = req.body;

    const response = await axios.post(`${AI_BRAIN_URL}/skills/ai-analyze`, {
      skills,
      target_role,
      experience
    }, {
      timeout: 60000
    });

    return res.json(response.data);
  } catch (error: any) {
    logger.error('Error analyzing skills:', error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.error || 'Failed to analyze skills'
    });
  }
});

// Get trending skills
router.get('/trending', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { industry } = req.query;

    const response = await axios.get(`${AI_BRAIN_URL}/skills/trending`, {
      params: { industry },
      timeout: 30000
    });

    return res.json(response.data);
  } catch (error: any) {
    logger.error('Error getting trending skills:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to get trending skills'
    });
  }
});

export default router;
