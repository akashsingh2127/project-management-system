import { prisma } from '../config/database';

export class DashboardService {
  static async getDashboardMetrics(userId: string) {
    const totalProjects = await prisma.project.count({
      where: { userId },
    });

    const projectsInProgress = await prisma.project.count({
      where: { userId, status: 'IN_PROGRESS' },
    });

    const tasks = await prisma.task.findMany({
      where: { project: { userId } },
      select: { status: true },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: { status: string }) => t.status === 'COMPLETED').length;
    const pendingTasks = tasks.filter((t: { status: string }) => t.status === 'PENDING').length;

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      projectsInProgress,
    };
  }
}
