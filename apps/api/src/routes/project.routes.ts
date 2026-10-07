import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { requireAuth } from '../middlewares/auth0';
import { validateRequest } from '../middlewares/validation';
import { createProjectSchema, updateProjectSchema } from '@project-management/common';

const router = Router();

router.use(requireAuth);

router.get('/', ProjectController.getProjects);
router.get('/:id', ProjectController.getProjectById);
router.post('/', validateRequest(createProjectSchema), ProjectController.createProject);
router.put('/:id', validateRequest(updateProjectSchema), ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);

export { router as projectRoutes };
