import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { ApiResponse } from '../responses/ApiResponse';

export class TaskController {
  static async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const filters = {
        name: req.query.name as string | undefined,
        status: req.query.status as string | undefined,
        priority: req.query.priority as string | undefined,
        projectId: req.query.projectId as string | undefined,
      };

      const { tasks, total } = await TaskService.getTasks(userId, filters, { page, limit });
      
      const totalPages = Math.ceil(total / limit);
      res.json(ApiResponse.success(tasks, undefined, {
        total,
        page,
        limit,
        totalPages,
      }));
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const task = await TaskService.getTaskById(userId, id);
      res.json(ApiResponse.success(task));
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const task = await TaskService.createTask(userId, req.body);
      res.status(201).json(ApiResponse.success(task));
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const task = await TaskService.updateTask(userId, id, req.body);
      res.json(ApiResponse.success(task));
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await TaskService.deleteTask(userId, id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
