import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { ApiResponse } from '../responses/ApiResponse';

export class DashboardController {
  static async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const metrics = await DashboardService.getDashboardMetrics(userId);
      res.json(ApiResponse.success(metrics));
    } catch (error) {
      next(error);
    }
  }
}
