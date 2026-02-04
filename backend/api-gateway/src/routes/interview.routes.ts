import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth.middleware';
import { aiRateLimiter } from '../middlewares/rateLimiter';
import { InterviewController } from '../controllers/interview.controller';

const router = Router();
const interviewController = new InterviewController();

// Configure multer for audio uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max for audio
  },
});

// All routes require authentication
router.use(authenticate);

// Create new interview session
router.post('/', interviewController.createInterview);

// Get all interviews for current user
router.get('/', interviewController.getInterviews);

// Get interview by ID
router.get('/:id', interviewController.getInterviewById);

// Start interview
router.post('/:id/start', interviewController.startInterview);

// Get next question
router.get(
  '/:id/next-question',
  aiRateLimiter,
  interviewController.getNextQuestion
);

// Submit answer (with audio)
router.post(
  '/:id/answer',
  upload.single('audio'),
  aiRateLimiter,
  interviewController.submitAnswer
);

// Complete interview
router.post(
  '/:id/complete',
  aiRateLimiter,
  interviewController.completeInterview
);

// Get interview evaluation
router.get('/:id/evaluation', interviewController.getEvaluation);

// Cancel interview
router.post('/:id/cancel', interviewController.cancelInterview);

// Get interview metrics (real-time)
router.get('/:id/metrics', interviewController.getMetrics);

export default router;
