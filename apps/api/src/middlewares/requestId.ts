import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  req.id = requestId as string;
  res.setHeader('X-Request-Id', req.id);
  next();
};
