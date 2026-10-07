import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger';
import { requestIdMiddleware } from './middlewares/requestId';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(requestIdMiddleware);
app.use(pinoHttp({ logger }));

// Health / Readiness
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/ready', (req, res) => {
  res.status(200).json({ status: 'READY' });
});

// Centralized Error Handling
app.use(errorHandler);

export { app };
