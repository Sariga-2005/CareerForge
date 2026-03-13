import { Router } from 'express';
import { FeedbackController } from '../controllers/feedback.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const feedbackController = new FeedbackController();

// Submit feedback (Public or Authenticated)
// We use a middleware that optionally attaches the user if present but doesn't block if not
router.post('/', (req, res, next) => {
  // If no auth header, just continue as anonymous
  if (!req.headers.authorization) return next();
  authenticate(req, res, next);
}, feedbackController.submitFeedback);

// Admin: Get all feedback
router.get('/', authenticate, authorize('admin'), feedbackController.getAllFeedback);

export default router;
