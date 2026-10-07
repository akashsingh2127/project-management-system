import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { requireAuth } from '../middlewares/auth0';

const router = Router();

router.use(requireAuth);

router.get('/', DashboardController.getDashboardMetrics);

export { router as dashboardRoutes };
