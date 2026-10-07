import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { logger } from '../utils/logger';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = req.auth;
      if (!auth || !auth.payload.sub) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { email, fullName } = req.body;
      const user = await AuthService.syncUser(auth.payload.sub, email, fullName);

      res.status(200).json({ message: 'User registered/synced successfully', user });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = req.auth;
      if (!auth || !auth.payload.sub) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { email, fullName } = req.body;
      let user;
      
      if (email && fullName) {
         user = await AuthService.syncUser(auth.payload.sub, email, fullName);
      } else {
         user = req.user; // from middleware
      }

      res.status(200).json({ message: 'Logged in successfully', user });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Auth0 logout is mostly handled client-side.
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({ user: req.user });
    } catch (error) {
      next(error);
    }
  }
}
