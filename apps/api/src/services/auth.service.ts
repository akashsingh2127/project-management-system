import { prisma } from '../config/database';
import { User } from '@prisma/client';

export class AuthService {
  static async syncUser(auth0Subject: string, email: string, fullName: string): Promise<User> {
    const user = await prisma.user.upsert({
      where: { auth0Subject },
      update: {
        email,
        fullName
      },
      create: {
        auth0Subject,
        email,
        fullName
      }
    });
    return user;
  }
}
