import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../responses/ApiResponse';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const reqId = req.id || req.headers['x-request-id'] || 'unknown';

  logger.error({ 
    err, 
    requestId: reqId,
    route: req.originalUrl,
    method: req.method
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(ApiResponse.error(err.message, err.errors));
  }

  // Handle generic JWT Error
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json(ApiResponse.error('Invalid token'));
  }

  // Handle Zod validation errors (fallback if middleware fails)
  if (err.name === 'ZodError') {
    return res.status(400).json(ApiResponse.error('Validation error', err.errors));
  }

  // Do not expose stack traces or internal errors to client
  res.status(500).json(ApiResponse.error('Internal Server Error'));
};
