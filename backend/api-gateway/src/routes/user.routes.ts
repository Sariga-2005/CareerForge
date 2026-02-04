import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticate);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.patch('/profile', userController.updateProfile);

// Upload profile image
router.post('/profile/image', userController.uploadProfileImage);

// Get user's dashboard data
router.get('/dashboard', userController.getDashboard);

// Update skills
router.patch('/skills', userController.updateSkills);

// Admin only routes
router.get('/', authorize('admin'), userController.getAllUsers);
router.get('/stats', authorize('admin'), userController.getUserStats);
router.get('/:id', authorize('admin'), userController.getUserById);
router.patch('/:id/status', authorize('admin'), userController.updateUserStatus);

export default router;
