import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

export class CacheService {
  /**
   * Get a value from the cache
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      if (!redisClient.isOpen) return null;
      const data = await redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error({ error, key }, 'Redis GET error');
      return null;
    }
  }

  /**
   * Set a value in the cache with a TTL (default 1 hour = 3600s)
   */
  static async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      if (!redisClient.isOpen) return;
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      logger.error({ error, key }, 'Redis SET error');
    }
  }

  /**
   * Delete a specific key from the cache
   */
  static async del(key: string): Promise<void> {
    try {
      if (!redisClient.isOpen) return;
      await redisClient.del(key);
    } catch (error) {
      logger.error({ error, key }, 'Redis DEL error');
    }
  }

  /**
   * Delete keys matching a pattern (e.g., when invalidating all lists)
   */
  static async deleteByPattern(pattern: string): Promise<void> {
    try {
      if (!redisClient.isOpen) return;
      // In production, consider using SCAN for large key spaces.
      // For user-scoped invalidation, keys is generally small enough.
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      logger.error({ error, pattern }, 'Redis deleteByPattern error');
    }
  }
}
