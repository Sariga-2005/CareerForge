import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import axios from 'axios';
import { authenticate, authorize, AuthRequest } from '../middlewares/auth.middleware';
import { JobController } from '../controllers/job.controller';
import { User } from '../models/User.model';
import { logger } from '../utils/logger';

const router = Router();
const jobController = new JobController();

// AI Brain service URL
const AI_BRAIN_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

// Validation middleware
const validate = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// Public routes (require authentication but not admin)
router.use(authenticate);

// Get all active jobs (with filters)
router.get('/', jobController.getJobs);

// Application routes (MUST be before /:id to avoid shadowing)
router.get('/applications/me', jobController.getMyApplications);

// Admin: Get all applications
router.get(
  '/applications',
  authorize('admin'),
  jobController.getAllApplications
);

router.post(
  '/applications/export',
  authorize('admin'),
  jobController.exportApplications
);

router.patch(
  '/applications/status',
  authorize('admin'),
  jobController.updateApplicationStatus
);

// Saved jobs routes
router.get('/saved', jobController.getSavedJobs);
router.post('/save', jobController.saveJob);
router.delete('/unsave/:jobId', jobController.unsaveJob);

// Get recommended jobs for user
router.get('/user/recommended', jobController.getRecommendedJobs);

// RAG Analysis: Semantic search + LLM-powered career analysis
router.post('/rag-analysis', async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.userId).select('skills department education firstName lastName');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const userSkills: string[] = (user as any)?.skills || [];
    const education = (user as any)?.department || 'Not specified';

    // Build student profile from the authenticated user's data
    const student_profile = {
      skills: userSkills,
      education,
      experience: 0, // Students typically have 0 years
      resume_text: req.body.resume_text || '',
      ...req.body.student_profile, // Allow overrides from frontend
    };

    logger.info(`[RAG Analysis] User ${req.userId} requesting RAG match with ${userSkills.length} skills`);

    const response = await axios.post(
      `${AI_BRAIN_URL}/job-matching/rag-match`,
      { student_profile, limit: req.body.limit || 5 },
      { timeout: 90000 } // 90s timeout for embedding + LLM
    );

    return res.json({
      success: true,
      data: response.data,
    });
  } catch (error: any) {
    logger.error(`[RAG Analysis] Error: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'AI service is currently unavailable. Please make sure AI Brain is running on port 5001.',
      });
    }
    return res.status(500).json({
      success: false,
      error: error.response?.data?.error || error.message || 'RAG analysis failed',
    });
  }
});

// Parameterized job routes (placed after specific routes)
router.get('/:id', jobController.getJobById);

// Apply for job
router.post('/:id/apply', jobController.applyForJob);

// Check if user has applied
router.get('/:id/application-status', jobController.getApplicationStatus);

// Admin routes for job management
router.post(
  '/',
  authorize('admin'),
  [
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('type').isIn(['full-time', 'internship', 'part-time', 'contract']),
    body('level').isIn(['entry', 'mid', 'senior']),
    body('applicationDeadline').isISO8601().withMessage('Valid deadline required'),
  ],
  validate,
  jobController.createJob
);

router.patch(
  '/:id',
  authorize('admin'),
  jobController.updateJob
);

router.delete(
  '/:id',
  authorize('admin'),
  jobController.deleteJob
);

router.patch(
  '/:id/status',
  authorize('admin'),
  jobController.updateJobStatus
);

router.get(
  '/:id/applications',
  authorize('admin'),
  jobController.getJobApplications
);

export default router;
