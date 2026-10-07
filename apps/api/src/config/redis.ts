import { createClient } from 'redis';
import { logger } from '../utils/logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => logger.error({ err }, 'Redis Client Error'));
redisClient.on('ready', () => logger.info('Redis Client Ready'));

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (err) {
    logger.error({ err }, 'Failed to connect to Redis');
  }
};
