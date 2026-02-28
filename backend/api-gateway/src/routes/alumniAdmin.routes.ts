import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { AlumniAdminController } from '../controllers/alumniAdmin.controller';

const router = Router();
const alumniAdminController = new AlumniAdminController();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Get all alumni
router.get('/', alumniAdminController.getAllAlumni);

// Search alumni by email
router.get('/search', alumniAdminController.searchAlumni);

// Get single alumni by ID
router.get('/:id', alumniAdminController.getAlumniById);

// Create alumni record
router.post('/', alumniAdminController.createAlumni);

// Update alumni record
router.put('/:id', alumniAdminController.updateAlumni);

// Delete alumni record
router.delete('/:id', alumniAdminController.deleteAlumni);

export default router;
