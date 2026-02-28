import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { PlacementReportController } from '../controllers/placementReport.controller';

const router = Router();
const placementReportController = new PlacementReportController();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Get all reports
router.get('/', placementReportController.getAllReports);

// Search reports
router.get('/search', placementReportController.searchReports);

// Get single report by ID
router.get('/:id', placementReportController.getReportById);

// Create report
router.post('/', placementReportController.createReport);

// Update report
router.put('/:id', placementReportController.updateReport);

// Delete report
router.delete('/:id', placementReportController.deleteReport);

export default router;
