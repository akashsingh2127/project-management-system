import { z } from 'zod';

export const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1, 'Task name is required').max(100),
  description: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING'),
  dueDate: z.coerce.date().optional().nullable(),
});

export const updateTaskSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  dueDate: z.coerce.date().optional().nullable(),
});
