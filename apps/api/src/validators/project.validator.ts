import { z } from 'zod';

export const projectIdSchema = z.object({
  id: z.string().uuid('Invalid project ID format'),
});

export const projectQuerySchema = z.object({
  name: z.string().optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional(),
});
