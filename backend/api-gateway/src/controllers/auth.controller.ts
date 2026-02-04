import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUser } from '../models/User.model';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest, generateTokens, blacklistToken, clearUserCache } from '../middlewares/auth.middleware';
import { cacheSet, cacheGet, cacheDelete } from '../config/redis';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'careerforge-super-secret-key';

export class AuthController {
  // Register new user
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, firstName, lastName, role = 'student', ...additionalFields } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ApiError('User with this email already exists', 409);
      }

      // Create user
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        role,
        ...additionalFields,
      });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Store refresh token in Redis
      await cacheSet(`refresh:${user._id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

      // Log registration
      logger.info(`New user registered: ${email} (${role})`);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: user.toPublicJSON(),
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Login
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user with password
      const user = await User.findOne({ email }).select('+password');
      
      if (!user || !(await user.comparePassword(password))) {
        throw new ApiError('Invalid email or password', 401);
      }

      if (!user.isActive) {
        throw new ApiError('Your account has been deactivated', 401);
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Store refresh token
      await cacheSet(`refresh:${user._id}`, refreshToken, 7 * 24 * 60 * 60);

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toPublicJSON(),
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Refresh token
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ApiError('Refresh token is required', 400);
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string; type: string };
      
      if (decoded.type !== 'refresh') {
        throw new ApiError('Invalid token type', 401);
      }

      // Check if refresh token is valid in Redis
      const storedToken = await cacheGet<string>(`refresh:${decoded.userId}`);
      if (storedToken !== refreshToken) {
        throw new ApiError('Invalid refresh token', 401);
      }

      // Get user
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new ApiError('User not found or inactive', 401);
      }

      // Generate new tokens
      const tokens = generateTokens(user);

      // Update stored refresh token
      await cacheSet(`refresh:${user._id}`, tokens.refreshToken, 7 * 24 * 60 * 60);

      res.json({
        success: true,
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  };

  // Logout
  logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (token) {
        // Blacklist the access token
        await blacklistToken(token);
      }

      // Remove refresh token
      if (req.userId) {
        await cacheDelete(`refresh:${req.userId}`);
        await clearUserCache(req.userId);
      }

      logger.info(`User logged out: ${req.user?.email}`);

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Get current user
  getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        data: { user: req.user },
      });
    } catch (error) {
      next(error);
    }
  };

  // Forgot password
  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      
      // Always return success to prevent email enumeration
      if (!user) {
        res.json({
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent.',
        });
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Store in Redis for 1 hour
      await cacheSet(`reset:${hashedToken}`, user._id.toString(), 3600);

      // TODO: Send email with reset link
      // For now, just log it
      logger.info(`Password reset requested for: ${email}`);

      res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
        // In development, return the token
        ...(process.env.NODE_ENV === 'development' && { resetToken }),
      });
    } catch (error) {
      next(error);
    }
  };

  // Reset password
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const userId = await cacheGet<string>(`reset:${hashedToken}`);

      if (!userId) {
        throw new ApiError('Invalid or expired reset token', 400);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      // Update password
      user.password = password;
      await user.save();

      // Delete reset token
      await cacheDelete(`reset:${hashedToken}`);

      // Clear user cache
      await clearUserCache(userId);

      logger.info(`Password reset successful for: ${user.email}`);

      res.json({
        success: true,
        message: 'Password reset successful. You can now login with your new password.',
      });
    } catch (error) {
      next(error);
    }
  };

  // Verify email
  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.params;

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const userId = await cacheGet<string>(`verify:${hashedToken}`);

      if (!userId) {
        throw new ApiError('Invalid or expired verification token', 400);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      user.isVerified = true;
      await user.save({ validateBeforeSave: false });

      await cacheDelete(`verify:${hashedToken}`);
      await clearUserCache(userId);

      logger.info(`Email verified for: ${user.email}`);

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
