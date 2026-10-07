import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { CreateProjectDto, UpdateProjectDto } from '@project-management/common';
import { ApiResponse } from '../responses/ApiResponse';

export class ProjectController {
  static async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      
      const filters = {
        name: req.query.name as string | undefined,
        status: req.query.status as string | undefined,
      };
      
      const { projects, total } = await ProjectService.getProjects(userId, filters, { page, limit });
      
      const totalPages = Math.ceil(total / limit);
      res.json(ApiResponse.success(projects, undefined, {
        total,
        page,
        limit,
        totalPages,
      }));
    } catch (error) {
      next(error);
    }
  }

  static async getProjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id;
      const project = await ProjectService.getProjectById(userId, projectId);
      res.json(ApiResponse.success(project));
    } catch (error) {
      next(error);
    }
  }

  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data: CreateProjectDto = req.body;
      const project = await ProjectService.createProject(userId, data);
      res.status(201).json(ApiResponse.success(project));
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id;
      const data: UpdateProjectDto = req.body;
      const project = await ProjectService.updateProject(userId, projectId, data);
      res.json(ApiResponse.success(project));
    } catch (error) {
      next(error);
    }
  }

  static async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id;
      await ProjectService.deleteProject(userId, projectId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
