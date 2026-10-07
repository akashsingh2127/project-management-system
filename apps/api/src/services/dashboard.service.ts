import { prisma } from '../config/database';
import { CacheService } from './cache.service';
import { CacheKeys } from '../constants/cacheKeys';

export class DashboardService {
  static async getDashboardMetrics(userId: string) {
    const cacheKey = CacheKeys.dashboard(userId);
    const cached = await CacheService.get<any>(cacheKey);
    if (cached) return cached;

    // Use Prisma aggregate/count efficiently
    const [
      totalProjects,
      projectsInProgress,
      totalTasks,
      completedTasks,
      pendingTasks
    ] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { project: { userId } } }),
      prisma.task.count({ where: { project: { userId }, status: 'COMPLETED' } }),
      prisma.task.count({ where: { project: { userId }, status: 'PENDING' } })
    ]);

    const metrics = {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      projectsInProgress,
    };

    // Cache with short TTL (e.g., 5 mins), though we also invalidate proactively
    await CacheService.set(cacheKey, metrics, 300);

    return metrics;
  }
}
