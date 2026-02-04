import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

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

// Register
router.post(
  '/register',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('role').optional().isIn(['student', 'alumni']).withMessage('Invalid role'),
  ],
  validate,
  authController.register
);

// Login
router.post(
  '/login',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Logout
router.post('/logout', authenticate, authController.logout);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

// Forgot password
router.post(
  '/forgot-password',
  authRateLimiter,
  [body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')],
  validate,
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password/:token',
  authRateLimiter,
  [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  validate,
  authController.resetPassword
);

// Verify email
router.get('/verify-email/:token', authController.verifyEmail);

export default router;
