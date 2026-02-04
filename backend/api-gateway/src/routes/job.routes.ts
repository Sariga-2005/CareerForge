import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { JobController } from '../controllers/job.controller';

const router = Router();
const jobController = new JobController();

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

// Get job by ID
router.get('/:id', jobController.getJobById);

// Apply for job
router.post('/:id/apply', jobController.applyForJob);

// Check if user has applied
router.get('/:id/application-status', jobController.getApplicationStatus);

// Get recommended jobs for user
router.get('/user/recommended', jobController.getRecommendedJobs);

// Admin routes
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
