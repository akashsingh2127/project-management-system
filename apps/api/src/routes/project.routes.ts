import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { requireAuth } from '../middlewares/auth0';
import { requireOwnership } from '../middlewares/authorize';
import { validateRequest, validateParams, validateQuery } from '../middlewares/validation';
import { createProjectSchema, updateProjectSchema } from '@project-management/common';
import { projectIdSchema, projectQuerySchema } from '../validators/project.validator';

const router = Router();

router.use(requireAuth, requireOwnership);

router.get('/', validateQuery(projectQuerySchema), ProjectController.getProjects);
router.get('/:id', validateParams(projectIdSchema), ProjectController.getProjectById);
router.post('/', validateRequest(createProjectSchema), ProjectController.createProject);
router.put('/:id', validateParams(projectIdSchema), validateRequest(updateProjectSchema), ProjectController.updateProject);
router.delete('/:id', validateParams(projectIdSchema), ProjectController.deleteProject);

export { router as projectRoutes };
