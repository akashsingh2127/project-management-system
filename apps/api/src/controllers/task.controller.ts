import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { CreateTaskDto, UpdateTaskDto } from '@project-management/common';
import { ApiResponse } from '../responses/ApiResponse';

export class TaskController {
  static async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const tasks = await TaskService.getTasks(userId);
      res.json(ApiResponse.success(tasks));
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const taskId = req.params.id;
      const task = await TaskService.getTaskById(userId, taskId);
      res.json(ApiResponse.success(task));
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data: CreateTaskDto = req.body;
      const task = await TaskService.createTask(userId, data);
      res.status(201).json(ApiResponse.success(task));
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const taskId = req.params.id;
      const data: UpdateTaskDto = req.body;
      const task = await TaskService.updateTask(userId, taskId, data);
      res.json(ApiResponse.success(task));
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const taskId = req.params.id;
      await TaskService.deleteTask(userId, taskId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
