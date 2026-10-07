import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth0';

const router = Router();

// We map /register and /login to require Auth0 tokens because
// Auth0 handles the password flow. The backend just syncs the user details.
router.post('/register', requireAuth, AuthController.register);
router.post('/login', requireAuth, AuthController.login);
router.post('/logout', requireAuth, AuthController.logout);
router.get('/me', requireAuth, AuthController.me);

export { router as authRoutes };
