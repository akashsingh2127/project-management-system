import { User } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    id: string;
    user?: User;
    auth?: {
      payload: {
        sub: string;
        email?: string;
        name?: string;
        [key: string]: any;
      };
      header: any;
      token: string;
    };
  }
}

export {};
