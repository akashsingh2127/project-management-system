import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { requireAuth } from '../middlewares/auth0';
import { requireOwnership } from '../middlewares/authorize';
import { validateRequest } from '../middlewares/validation';
import { createTaskSchema, updateTaskSchema } from '@project-management/common';

const router = Router();

router.use(requireAuth, requireOwnership);

router.get('/', TaskController.getTasks);
router.get('/:id', TaskController.getTaskById);
router.post('/', validateRequest(createTaskSchema), TaskController.createTask);
router.put('/:id', validateRequest(updateTaskSchema), TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

export { router as taskRoutes };
