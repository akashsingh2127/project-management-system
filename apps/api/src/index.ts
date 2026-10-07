import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { logger } from './utils/logger';

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
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
