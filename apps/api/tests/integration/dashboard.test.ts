import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/config/database';
import { CacheService } from '../../src/services/cache.service';
import { redisClient } from '../../src/config/redis';

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
          sub: 'auth0|dash123',
          email: 'test@dash.com',
          name: 'Test Dash User'
        }
      };
      return next();
    }

    if (token === 'other-user-token') {
      req.auth = {
        payload: {
          sub: 'auth0|dash456',
          email: 'other@dash.com',
          name: 'Other Dash User'
        }
      };
      return next();
    }
    
    return res.status(401).json({ error: 'Unauthorized' });
  }
}));

describe('Dashboard Endpoints', () => {
  let user1Id: string;
  let user2Id: string;

  beforeAll(async () => {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // Sync users
    await request(app).get('/api/auth/me').set('Authorization', 'Bearer valid-token');
    await request(app).get('/api/auth/me').set('Authorization', 'Bearer other-user-token');

    const user1 = await prisma.user.findUnique({ where: { auth0Subject: 'auth0|dash123' }});
    const user2 = await prisma.user.findUnique({ where: { auth0Subject: 'auth0|dash456' }});
    user1Id = user1!.id;
    user2Id = user2!.id;
  });

  afterAll(async () => {
    await prisma.task.deleteMany({ where: { project: { userId: { in: [user1Id, user2Id] } } } });
    await prisma.project.deleteMany({ where: { userId: { in: [user1Id, user2Id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [user1Id, user2Id] } } });
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.task.deleteMany({ where: { project: { userId: { in: [user1Id, user2Id] } } } });
    await prisma.project.deleteMany({ where: { userId: { in: [user1Id, user2Id] } } });
    if (redisClient.isOpen) {
      await redisClient.flushAll();
    }
  });

  it('should return empty metrics for a new user', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      totalProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      projectsInProgress: 0
    });
  });

  it('should correctly calculate dashboard metrics', async () => {
    // User 1 projects
    const p1 = await prisma.project.create({ data: { name: 'P1', status: 'IN_PROGRESS', userId: user1Id } });
    const p2 = await prisma.project.create({ data: { name: 'P2', status: 'COMPLETED', userId: user1Id } });
    const p3 = await prisma.project.create({ data: { name: 'P3', status: 'NOT_STARTED', userId: user1Id } });

    // User 1 tasks
    await prisma.task.create({ data: { name: 'T1', status: 'COMPLETED', projectId: p1.id } });
    await prisma.task.create({ data: { name: 'T2', status: 'COMPLETED', projectId: p1.id } });
    await prisma.task.create({ data: { name: 'T3', status: 'PENDING', projectId: p2.id } });
    await prisma.task.create({ data: { name: 'T4', status: 'IN_PROGRESS', projectId: p3.id } });

    // User 2 noise to ensure isolation
    const u2p = await prisma.project.create({ data: { name: 'U2P', status: 'IN_PROGRESS', userId: user2Id } });
    await prisma.task.create({ data: { name: 'U2T', status: 'COMPLETED', projectId: u2p.id } });

    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      totalProjects: 3,
      projectsInProgress: 1,
      totalTasks: 4,
      completedTasks: 2,
      pendingTasks: 1,
    });

    // Verify cache is set
    const cached = await CacheService.get(`dashboard:${user1Id}`);
    expect(cached).toBeDefined();
    expect(cached).toEqual({
      totalProjects: 3,
      projectsInProgress: 1,
      totalTasks: 4,
      completedTasks: 2,
      pendingTasks: 1,
    });
  });

  it('should prevent cross-user metric access', async () => {
    // User 1 projects
    await prisma.project.create({ data: { name: 'P1', status: 'IN_PROGRESS', userId: user1Id } });

    // User 2 requests their dashboard
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', 'Bearer other-user-token');

    // Should return 0 since User 2 has no projects
    expect(res.status).toBe(200);
    expect(res.body.data.totalProjects).toBe(0);
  });
});
