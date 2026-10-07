import { prisma } from '../config/database';
import { CreateProjectDto, UpdateProjectDto } from '@project-management/common';
import { NotFoundError } from '../utils/errors';

export class ProjectService {
  static async getProjects(userId: string, filters?: { name?: string; status?: string }) {
    const where: any = { userId };
    
    if (filters?.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }

    return prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getProjectById(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
      include: { tasks: true }
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    return project;
  }

  static async createProject(userId: string, data: CreateProjectDto) {
    return prisma.project.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  static async updateProject(userId: string, projectId: string, data: UpdateProjectDto) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    return prisma.project.update({
      where: { id: projectId },
      data,
    });
  }

  static async deleteProject(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    return prisma.project.delete({
      where: { id: projectId },
    });
  }
}
