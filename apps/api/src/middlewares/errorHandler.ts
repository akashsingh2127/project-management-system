import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../responses/ApiResponse';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(ApiResponse.error(err.message, err.errors));
  }

  // Handle generic JWT Error
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json(ApiResponse.error('Invalid token'));
  }

  res.status(500).json(ApiResponse.error('Internal Server Error'));
};
