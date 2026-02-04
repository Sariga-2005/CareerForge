import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();
const analyticsController = new AnalyticsController();

// All routes require authentication
router.use(authenticate);

// Student analytics
router.get('/student/dashboard', analyticsController.getStudentDashboard);
router.get('/student/progress', analyticsController.getStudentProgress);
router.get('/student/interviews', analyticsController.getInterviewAnalytics);

// Admin analytics
router.get(
  '/admin/dashboard',
  authorize('admin'),
  analyticsController.getAdminDashboard
);

router.get(
  '/admin/placement-stats',
  authorize('admin'),
  analyticsController.getPlacementStats
);

router.get(
  '/admin/batch-analytics',
  authorize('admin'),
  analyticsController.getBatchAnalytics
);

router.get(
  '/admin/department-analytics',
  authorize('admin'),
  analyticsController.getDepartmentAnalytics
);

router.get(
  '/admin/skill-gap-report',
  authorize('admin'),
  analyticsController.getSkillGapReport
);

router.get(
  '/admin/company-analytics',
  authorize('admin'),
  analyticsController.getCompanyAnalytics
);

router.get(
  '/admin/trends',
  authorize('admin'),
  analyticsController.getTrends
);

// Reports
router.get(
  '/reports/placement',
  authorize('admin'),
  analyticsController.generatePlacementReport
);

router.get(
  '/reports/batch/:batch',
  authorize('admin'),
  analyticsController.generateBatchReport
);

export default router;
