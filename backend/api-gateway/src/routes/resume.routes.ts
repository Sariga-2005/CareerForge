import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { aiRateLimiter } from '../middlewares/rateLimiter';
import { ResumeController } from '../controllers/resume.controller';

const router = Router();
const resumeController = new ResumeController();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

// Upload resume
router.post(
  '/upload',
  upload.single('resume'),
  resumeController.uploadResume
);

// Get all resumes for current user
router.get('/', resumeController.getResumes);

// Get specific resume
router.get('/:id', resumeController.getResumeById);

// Re-analyze a resume (triggers AI parsing again)
router.post('/:id/reanalyze', resumeController.reanalyzeResume);

// Delete resume
router.delete('/:id', resumeController.deleteResume);

// Trigger AI analysis (rate limited)
router.post(
  '/:id/analyze',
  aiRateLimiter,
  resumeController.analyzeResume
);

// Get analysis results
router.get('/:id/analysis', resumeController.getAnalysis);

// Get skill gap recommendations
router.get('/:id/skill-gaps', resumeController.getSkillGaps);

// Get job matches based on resume
router.get(
  '/:id/job-matches',
  aiRateLimiter,
  resumeController.getJobMatches
);

// Admin routes
router.get(
  '/admin/all',
  authorize('admin'),
  resumeController.getAllResumes
);

export default router;
