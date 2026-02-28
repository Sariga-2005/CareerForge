import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { PlacementPredictionController } from '../controllers/placementPrediction.controller';

const router = Router();
const controller = new PlacementPredictionController();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Get all predictions
router.get('/', controller.getAllPredictions);

// Search predictions
router.get('/search', controller.searchPredictions);

// Auto-generate predictions from student data
router.post('/generate', controller.generatePredictions);

// Create manual prediction
router.post('/', controller.createPrediction);

// Update prediction
router.put('/:id', controller.updatePrediction);

// Delete prediction
router.delete('/:id', controller.deletePrediction);

export default router;
