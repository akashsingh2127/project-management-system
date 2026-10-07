import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { requireAuth } from '../middlewares/auth0';
import { requireOwnership } from '../middlewares/authorize';

const router = Router();

// All dashboard routes require authentication and ownership
router.use(requireAuth, requireOwnership);

router.get('/', DashboardController.getMetrics);

export { router as dashboardRoutes };
