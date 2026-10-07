import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/config/database';

jest.mock('express-oauth2-jwt-bearer', () => ({
  auth: () => (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    if (token === 'valid-token') {
      req.auth = {
        payload: {
          sub: 'auth0|123456',
          email: 'test@example.com',
          name: 'Test User'
        }
      };
      return next();
    }
    
    if (token === 'expired-token') {
      return res.status(401).json({ error: 'Token Expired' });
    }

    if (token === 'invalid-token') {
      return res.status(401).json({ error: 'Invalid Token' });
    }

    return res.status(401).json({ error: 'Unauthorized' });
  }
}));

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { auth0Subject: 'auth0|123456' }
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { auth0Subject: 'auth0|123456' }
    });
    await prisma.$disconnect();
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('should return 401 for an invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
  });

  it('should return 401 for an expired token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer expired-token');
    expect(res.status).toBe(401);
  });

  it('should sync and return user on /api/auth/login with valid token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Authorization', 'Bearer valid-token')
      .send({ email: 'test@example.com', fullName: 'Test User' });
    
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.auth0Subject).toBe('auth0|123456');

    // verify it's in the DB
    const dbUser = await prisma.user.findUnique({
      where: { auth0Subject: 'auth0|123456' }
    });
    expect(dbUser).toBeDefined();
    expect(dbUser?.email).toBe('test@example.com');
  });

  it('should return user info on /api/auth/me with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer valid-token');
    
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
  });
  
  it('should auto-create placeholder user on /api/auth/me if not exists', async () => {
    // Delete the user first to simulate a first-time login where /login wasn't called
    await prisma.user.deleteMany({
      where: { auth0Subject: 'auth0|123456' }
    });
    
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer valid-token');
      
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com'); // From our mock payload
    expect(res.body.user.fullName).toBe('Test User');
  });
});
