import { z } from 'zod';

export const taskIdSchema = z.object({
  id: z.string().uuid('Invalid task ID format'),
});

export const taskQuerySchema = z.object({
  name: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  projectId: z.string().uuid('Invalid project ID format').optional(),
});
