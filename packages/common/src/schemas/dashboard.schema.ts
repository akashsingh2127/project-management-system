import { z } from 'zod';

export const dashboardResponseSchema = z.object({
  totalProjects: z.number(),
  totalTasks: z.number(),
  completedTasks: z.number(),
  pendingTasks: z.number(),
  projectsInProgress: z.number(),
});
