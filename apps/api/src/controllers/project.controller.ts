import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { CreateProjectDto, UpdateProjectDto } from '@project-management/common';
import { ApiResponse } from '../responses/ApiResponse';

export class ProjectController {
  static async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const filters = {
        name: req.query.name as string | undefined,
        status: req.query.status as string | undefined,
      };
      const projects = await ProjectService.getProjects(userId, filters);
      res.json(ApiResponse.success(projects));
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
