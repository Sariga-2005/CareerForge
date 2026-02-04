import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType | null = null;
let isRedisConnected = false;

export const connectRedis = async (): Promise<RedisClientType | null> => {
  const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
  const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

  if (!REDIS_ENABLED) {
    logger.warn('⚠️ Redis is disabled. Running without caching.');
    return null;
  }

  try {
    redisClient = createClient({
      url: REDIS_URL,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            logger.warn('Redis: Max reconnection attempts reached. Running without Redis.');
            return false;
          }
          return Math.min(retries * 100, 1000);
        },
      },
    });

    redisClient.on('error', (err) => {
      if (isRedisConnected) {
        logger.error('Redis Client Error:', err);
      }
    });

    redisClient.on('connect', () => {
      logger.info('🔴 Redis connecting...');
    });

    redisClient.on('ready', () => {
      isRedisConnected = true;
      logger.info('🔴 Redis connected and ready');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis reconnecting...');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.warn('⚠️ Could not connect to Redis. Running without caching.');
    redisClient = null;
    return null;
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

export const isRedisAvailable = (): boolean => {
  return redisClient !== null && isRedisConnected;
};

// Cache helpers - now handle null redis gracefully
export const cacheSet = async (key: string, value: any, ttlSeconds: number = 3600): Promise<void> => {
  if (!redisClient) return;
  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    logger.warn('Cache set failed:', error);
  }
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  if (!redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.warn('Cache get failed:', error);
    return null;
  }
};

export const cacheDelete = async (key: string): Promise<void> => {
  if (!redisClient) return;
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.warn('Cache delete failed:', error);
  }
};

export const cacheFlushPattern = async (pattern: string): Promise<void> => {
  if (!redisClient) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    logger.warn('Cache flush failed:', error);
  }
};
