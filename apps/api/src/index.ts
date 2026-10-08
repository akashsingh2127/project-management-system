import dotenv from 'dotenv';
dotenv.config();

import { logger } from './utils/logger';
import { connectRedis } from './config/redis';

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Ensure Redis is connected before initializing the rate limiter (which happens in app.ts)
    await connectRedis();

    const { app } = await import('./app');

    const server = app.listen(port as number, '0.0.0.0', () => {
      logger.info(`Server is running on port ${port}`);
    });

    // Graceful Shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
