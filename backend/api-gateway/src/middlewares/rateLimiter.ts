import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { getRedisClient, isRedisAvailable } from '../config/redis';
import { logger } from '../utils/logger';

// Standard rate limiter
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 10000 requests per windowMs (dev mode)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes',
    });
  },
});

// Strict rate limiter for auth routes
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes (reduced from 1 hour)
  max: 1000, // 1000 attempts per 15 min (dev mode)
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after an hour',
  },
  skipSuccessfulRequests: true,
});

// API rate limiter for AI services (more expensive operations)
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 AI requests per minute (dev mode)
  message: {
    success: false,
    message: 'AI service rate limit exceeded. Please wait before making more requests.',
  },
});

// Dynamic rate limiter using Redis
export const createDynamicRateLimiter = (
  keyPrefix: string,
  maxRequests: number,
  windowSeconds: number
) => {
  return async (req: Request, res: Response, next: Function) => {
    try {
      // If Redis is not available, skip rate limiting
      if (!isRedisAvailable()) {
        return next();
      }
      
      const redis = getRedisClient();
      if (!redis) {
        return next();
      }
      
      const key = `ratelimit:${keyPrefix}:${req.ip}`;
      
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }
      
      if (current > maxRequests) {
        return res.status(429).json({
          success: false,
          message: `Rate limit exceeded. Try again in ${windowSeconds} seconds.`,
        });
      }
      
      next();
    } catch (error) {
      logger.error('Rate limiter error:', error);
      next(); // Fail open if Redis is unavailable
    }
  };
};
