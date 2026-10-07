import { prisma } from '../config/database';
import { CreateTaskDto, UpdateTaskDto } from '@project-management/common';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class TaskService {
  static async getTasks(userId: string) {
    return prisma.task.findMany({
      where: {
        project: {
          userId,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: { project: true }
    });
  }

  static async getTaskById(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          userId,
        },
      },
      include: { project: true }
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  static async createTask(userId: string, data: CreateTaskDto) {
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId },
    });

    if (!project) {
      throw new ForbiddenError('Project does not exist or you do not have access');
    }

    return prisma.task.create({
      data,
    });
  }

  static async updateTask(userId: string, taskId: string, data: UpdateTaskDto) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: { userId },
      },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return prisma.task.update({
      where: { id: taskId },
      data,
    });
  }

  static async deleteTask(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: { userId },
      },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return prisma.task.delete({
      where: { id: taskId },
    });
  }
}
