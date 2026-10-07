import { prisma } from '../config/database';
import { CreateTaskDto, UpdateTaskDto } from '@project-management/common';
import { NotFoundError } from '../utils/errors';
import { CacheService } from './cache.service';
import { CacheKeys } from '../constants/cacheKeys';

export class TaskService {
  /**
   * Helper to invalidate cache related to a user's tasks
   */
  private static async invalidateTaskCaches(userId: string, taskId?: string) {
    await CacheService.deleteByPattern(CacheKeys.userTasksPattern(userId));
    if (taskId) {
      await CacheService.del(CacheKeys.task(userId, taskId));
    }
    // Also invalidate dashboard because task changes affect statistics
    await CacheService.del(CacheKeys.dashboard(userId));
  }

  static async getTasks(userId: string, filters?: { name?: string; status?: string; priority?: string; projectId?: string }) {
    const queryParamsStr = JSON.stringify(filters || {});
    const cacheKey = CacheKeys.userTasks(userId, queryParamsStr);

    const cached = await CacheService.get<any>(cacheKey);
    if (cached) return cached;

    // Build query
    const where: any = { 
      project: {
        userId
      }
    };
    
    if (filters?.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: { id: true, name: true }
        }
      }
    });

    await CacheService.set(cacheKey, tasks, 300); // 5 mins
    return tasks;
  }

  static async getTaskById(userId: string, taskId: string) {
    const cacheKey = CacheKeys.task(userId, taskId);
    const cached = await CacheService.get<any>(cacheKey);
    if (cached) return cached;

    const task = await prisma.task.findFirst({
      where: { 
        id: taskId,
        project: {
          userId
        }
      },
      include: {
        project: {
          select: { id: true, name: true }
        }
      }
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    await CacheService.set(cacheKey, task, 300);
    return task;
  }

  static async createTask(userId: string, data: CreateTaskDto) {
    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId }
    });

    if (!project) {
      throw new NotFoundError('Project not found'); 
    }

    const task = await prisma.task.create({
      data
    });

    await this.invalidateTaskCaches(userId);
    return task;
  }

  static async updateTask(userId: string, taskId: string, data: UpdateTaskDto) {
    // Find task and verify project ownership
    const task = await prisma.task.findFirst({
      where: { 
        id: taskId,
        project: {
          userId
        }
      }
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data,
    });

    await this.invalidateTaskCaches(userId, taskId);
    return updatedTask;
  }

  static async deleteTask(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: { 
        id: taskId,
        project: {
          userId
        }
      }
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    await this.invalidateTaskCaches(userId, taskId);
    return { success: true };
  }
}
