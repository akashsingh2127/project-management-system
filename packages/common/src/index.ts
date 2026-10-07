export * from './schemas/project.schema';
export * from './schemas/task.schema';
export * from './schemas/auth.schema';
export * from './schemas/dashboard.schema';

import { z } from 'zod';
import { createProjectSchema, updateProjectSchema } from './schemas/project.schema';
import { createTaskSchema, updateTaskSchema } from './schemas/task.schema';
import { dashboardResponseSchema } from './schemas/dashboard.schema';

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;
export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type DashboardResponseDto = z.infer<typeof dashboardResponseSchema>;

