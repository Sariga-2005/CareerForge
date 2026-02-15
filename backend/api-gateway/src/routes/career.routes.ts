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

// Generate career path
router.post('/path', aiRateLimiter, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { student_profile } = req.body;

    logger.info(`[Career Path] Received request with profile: ${JSON.stringify(student_profile)?.substring(0, 200)}`);

    if (!student_profile) {
      return res.status(400).json({
        success: false,
        error: 'Student profile is required'
      });
    }

    const url = `${AI_BRAIN_URL}/career/generate`;
    logger.info(`[Career Path] Calling AI Brain at: ${url}`);

    // Call AI Brain service - uses /career/generate endpoint
    const response = await axios.post(url, {
      student_profile
    }, {
      timeout: 60000 // 60 second timeout for AI processing
    });

    logger.info(`[Career Path] AI Brain response success: ${response.data?.success}`);
    return res.json(response.data);
  } catch (error: any) {
    logger.error(`[Career Path] Error: ${error.message}`);
    logger.error(`[Career Path] Error code: ${error.code}`);
    logger.error(`[Career Path] Response data: ${JSON.stringify(error.response?.data)}`);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'AI service is currently unavailable. Please make sure AI Brain is running on port 5001.'
      });
    }

    return res.status(500).json({
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to generate career path'
    });
  }
});

// Get career recommendations
router.post('/recommendations', aiRateLimiter, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { student_profile } = req.body;

    const response = await axios.post(`${AI_BRAIN_URL}/career/recommendations`, {
      student_profile
    }, {
      timeout: 60000
    });

    return res.json(response.data);
  } catch (error: any) {
    logger.error('Error getting career recommendations:', error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.error || 'Failed to get recommendations'
    });
  }
});

export default router;
