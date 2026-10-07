import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../responses/ApiResponse';

export const requireOwnership = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json(ApiResponse.error('Unauthenticated'));
  }
  next();
};
