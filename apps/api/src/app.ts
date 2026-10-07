import express from 'express';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger';
import { requestIdMiddleware } from './middlewares/requestId';
import { errorHandler } from './middlewares/errorHandler';
import { routes } from './routes';

import { securityMiddleware } from './middlewares/security';
import { globalRateLimiter } from './middlewares/rateLimiter';
import { notFoundHandler } from './middlewares/notFound';

const app = express();

app.use(securityMiddleware);
app.use(globalRateLimiter);
app.use(requestIdMiddleware);
app.use(
  pinoHttp({
    logger,
    customProps: (req) => ({ requestId: req.id }),
  })
);

// Health / Readiness
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/ready', (req, res) => {
  res.status(200).json({ status: 'READY' });
});

// Centralized Error Handling
app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
