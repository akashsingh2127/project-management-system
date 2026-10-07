import { Request, Response } from 'express';
import { ApiResponse } from '../responses/ApiResponse';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(ApiResponse.error(`Route ${req.originalUrl} not found`));
};
