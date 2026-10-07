import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { requireAuth } from '../middlewares/auth0';
import { requireOwnership } from '../middlewares/authorize';
import { validateRequest, validateParams, validateQuery } from '../middlewares/validation';
import { createTaskSchema, updateTaskSchema } from '@project-management/common';
import { taskIdSchema, taskQuerySchema } from '../validators/task.validator';

const router = Router();

// All task routes require authentication and ownership check
router.use(requireAuth, requireOwnership);

router.get(
  '/',
  validateQuery(taskQuerySchema),
  TaskController.getTasks
);

router.get(
  '/:id',
  validateParams(taskIdSchema),
  TaskController.getTaskById
);

router.post(
  '/',
  validateRequest(createTaskSchema),
  TaskController.createTask
);

router.put(
  '/:id',
  validateParams(taskIdSchema),
  validateRequest(updateTaskSchema),
  TaskController.updateTask
);

router.delete(
  '/:id',
  validateParams(taskIdSchema),
  TaskController.deleteTask
);

export { router as taskRoutes };
