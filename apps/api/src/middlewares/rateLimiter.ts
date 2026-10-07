import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../config/redis';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  store: process.env.NODE_ENV === 'test' 
    ? undefined 
    : new RedisStore({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
      }),
  message: {
    status: 429,
    code: 'TOO_MANY_REQUESTS',
    message: 'Too many requests, please try again later.'
  }
});
