import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.model';
import { ApiError } from './errorHandler';
import { logger } from '../utils/logger';
import { cacheGet, cacheSet, cacheDelete } from '../config/redis';

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'careerforge-super-secret-key';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Access token is required', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Check if token is blacklisted (for logout)
    const isBlacklisted = await cacheGet<boolean>(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new ApiError('Token has been revoked', 401);
    }

    // Try to get user from cache first
    let user = await cacheGet<IUser>(`user:${decoded.userId}`);

    if (!user) {
      // Fetch from database
      const dbUser = await User.findById(decoded.userId).select('-password');
      
      if (!dbUser) {
        throw new ApiError('User not found', 401);
      }

      if (!dbUser.isActive) {
        throw new ApiError('Account has been deactivated', 401);
      }

      user = dbUser.toObject() as IUser;
      
      // Cache user for 5 minutes
      await cacheSet(`user:${decoded.userId}`, user, 300);
    }

    // Attach user to request
    req.user = user;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

// Role-based access control
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user ${req.user._id} to ${req.originalUrl}`);
      return next(new ApiError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

// Generate tokens
export const generateTokens = (user: IUser): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Blacklist token (for logout)
export const blacklistToken = async (token: string): Promise<void> => {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    if (decoded && decoded.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await cacheSet(`blacklist:${token}`, true, ttl);
      }
    }
  } catch (error) {
    logger.error('Error blacklisting token:', error);
  }
};

// Clear user cache
export const clearUserCache = async (userId: string): Promise<void> => {
  await cacheDelete(`user:${userId}`);
};
