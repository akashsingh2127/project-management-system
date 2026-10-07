import { Request, Response, NextFunction } from 'express';
import { checkJwt } from '../config/auth0';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

const attachUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = req.auth;
    if (!auth || !auth.payload.sub) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const auth0Subject = auth.payload.sub;
    let user = await prisma.user.findUnique({ where: { auth0Subject } });

    if (!user) {
      // Create user using basic payload info or placeholder
      // For a robust implementation, the frontend should sync the user on login via POST /api/auth/login
      const email = auth.payload.email as string || `${auth0Subject}@placeholder.com`;
      const fullName = auth.payload.name as string || 'Unknown User';

      user = await prisma.user.create({
        data: {
          auth0Subject,
          email,
          fullName
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(error, 'Error in attachUser middleware');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const requireAuth = [checkJwt, attachUser];
