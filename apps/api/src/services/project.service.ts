import { prisma } from '../config/database';
import { CreateProjectDto, UpdateProjectDto } from '@project-management/common';
import { NotFoundError } from '../utils/errors';
import { CacheService } from './cache.service';
import { CacheKeys } from '../constants/cacheKeys';

export class ProjectService {
  /**
   * Helper to invalidate cache related to a user's projects
   */
  private static async invalidateProjectCaches(userId: string, projectId?: string) {
    await CacheService.deleteByPattern(CacheKeys.userProjectsPattern(userId));
    if (projectId) {
      await CacheService.del(CacheKeys.project(userId, projectId));
    }
    await CacheService.del(CacheKeys.dashboard(userId));
  }

  static async getProjects(userId: string, filters?: { name?: string; status?: string }) {
    const queryParamsStr = JSON.stringify(filters || {});
    const cacheKey = CacheKeys.userProjects(userId, queryParamsStr);

    const cached = await CacheService.get<any>(cacheKey);
    if (cached) return cached;

    const where: any = { userId };
    
    if (filters?.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    await CacheService.set(cacheKey, projects, 300);
    return projects;
  }

  static async getProjectById(userId: string, projectId: string) {
    const cacheKey = CacheKeys.project(userId, projectId);
    const cached = await CacheService.get<any>(cacheKey);
    if (cached) return cached;

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
      include: { tasks: true }
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    await CacheService.set(cacheKey, project, 300);
    return project;
  }

  static async createProject(userId: string, data: CreateProjectDto) {
    const project = await prisma.project.create({
      data: {
        userId,
        ...data,
      },
    });

    await this.invalidateProjectCaches(userId);
    return project;
  }

  static async updateProject(userId: string, projectId: string, data: UpdateProjectDto) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data,
    });

    await this.invalidateProjectCaches(userId, projectId);
    return updatedProject;
  }

  static async deleteProject(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    await this.invalidateProjectCaches(userId, projectId);
    return { success: true };
  }
}
