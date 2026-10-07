import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { requireAuth } from '../middlewares/auth0';
import { requireOwnership } from '../middlewares/authorize';

const router = Router();

router.use(requireAuth, requireOwnership);

router.get('/', DashboardController.getDashboardMetrics);

export { router as dashboardRoutes };
