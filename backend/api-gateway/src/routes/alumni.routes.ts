import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { AlumniController } from '../controllers/alumni.controller';

const router = Router();
const alumniController = new AlumniController();

// All routes require authentication
router.use(authenticate);

// Alumni dashboard
router.get('/dashboard', authorize('alumni', 'admin'), alumniController.getDashboard);

// Get referral requests
router.get(
  '/referrals',
  authorize('alumni', 'admin'),
  alumniController.getReferralRequests
);

// Accept/reject referral
router.patch(
  '/referrals/:id',
  authorize('alumni', 'admin'),
  alumniController.handleReferral
);

// Get mentorship requests
router.get(
  '/mentorship',
  authorize('alumni', 'admin'),
  alumniController.getMentorshipRequests
);

// Accept/reject mentorship
router.patch(
  '/mentorship/:id',
  authorize('alumni', 'admin'),
  alumniController.handleMentorship
);

// Update availability
router.patch(
  '/availability',
  authorize('alumni'),
  alumniController.updateAvailability
);

// Student routes to request referral/mentorship
router.post(
  '/request-referral/:jobId',
  authorize('student'),
  alumniController.requestReferral
);

router.post(
  '/request-mentorship/:alumniId',
  authorize('student'),
  alumniController.requestMentorship
);

// Get available alumni for mentorship
router.get(
  '/available-mentors',
  authorize('student'),
  alumniController.getAvailableMentors
);

// Admin routes
router.get(
  '/stats',
  authorize('admin'),
  alumniController.getAlumniStats
);

router.get(
  '/engagement-report',
  authorize('admin'),
  alumniController.getEngagementReport
);

export default router;
