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
          sub: 'auth0|task123',
          email: 'test@task.com',
          name: 'Test Task User'
        }
      };
      return next();
    }

    if (token === 'other-user-token') {
      req.auth = {
        payload: {
          sub: 'auth0|task456',
          email: 'other@task.com',
          name: 'Other Task User'
        }
      };
      return next();
    }
    
    return res.status(401).json({ error: 'Unauthorized' });
  }
}));

describe('Task Endpoints', () => {
  let user1Id: string;
  let user2Id: string;
  let project1Id: string;
  let project2Id: string;

  beforeAll(async () => {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // Sync users
    await request(app).get('/api/auth/me').set('Authorization', 'Bearer valid-token');
    await request(app).get('/api/auth/me').set('Authorization', 'Bearer other-user-token');

    const user1 = await prisma.user.findUnique({ where: { auth0Subject: 'auth0|task123' }});
    const user2 = await prisma.user.findUnique({ where: { auth0Subject: 'auth0|task456' }});
    user1Id = user1!.id;
    user2Id = user2!.id;

    // Create projects
    const p1 = await prisma.project.create({ data: { name: 'P1', userId: user1Id } });
    const p2 = await prisma.project.create({ data: { name: 'P2', userId: user2Id } });
    project1Id = p1.id;
    project2Id = p2.id;
  });

  afterAll(async () => {
    await prisma.task.deleteMany({ where: { projectId: { in: [project1Id, project2Id] } } });
    await prisma.project.deleteMany({ where: { userId: { in: [user1Id, user2Id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [user1Id, user2Id] } } });
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.task.deleteMany({ where: { projectId: { in: [project1Id, project2Id] } } });
    if (redisClient.isOpen) {
      await redisClient.flushAll();
    }
  });

  it('should create a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', 'Bearer valid-token')
      .send({
        projectId: project1Id,
        name: 'Test Task',
        description: 'Testing',
        priority: 'HIGH',
        status: 'PENDING'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test Task');
    expect(res.body.data.priority).toBe('HIGH');
  });

  it('should not allow creating task under another user project', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', 'Bearer valid-token')
      .send({
        projectId: project2Id,
        name: 'Hacked Task',
      });
    
    expect(res.status).toBe(404);
  });

  it('should get all tasks for a user and cache them', async () => {
    await prisma.task.create({ data: { name: 'T1', projectId: project1Id } });
    await prisma.task.create({ data: { name: 'T2', projectId: project1Id } });

    // 1st request - Cache miss
    const res1 = await request(app)
      .get('/api/tasks')
      .set('Authorization', 'Bearer valid-token');

    expect(res1.status).toBe(200);
    expect(res1.body.data).toHaveLength(2);

    // Verify cache is populated
    const cachedTasks = await CacheService.get(`tasks:${user1Id}:list:{}`);
    expect(cachedTasks).toBeDefined();

    // 2nd request - Cache hit
    const res2 = await request(app)
      .get('/api/tasks')
      .set('Authorization', 'Bearer valid-token');
    
    expect(res2.status).toBe(200);
    expect(res2.body.data).toHaveLength(2);
  });

  it('should filter tasks by name', async () => {
    await prisma.task.create({ data: { name: 'Alpha', projectId: project1Id } });
    await prisma.task.create({ data: { name: 'Beta', projectId: project1Id } });

    const res = await request(app)
      .get('/api/tasks?name=alpha')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Alpha');
  });

  it('should get a single task by id and cache it', async () => {
    const t = await prisma.task.create({ data: { name: 'Single', projectId: project1Id } });

    const res = await request(app)
      .get(`/api/tasks/${t.id}`)
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Single');

    const cachedTask = await CacheService.get(`tasks:${user1Id}:${t.id}`);
    expect(cachedTask).toBeDefined();
  });

  it('should update a task and invalidate cache', async () => {
    const t = await prisma.task.create({ data: { name: 'Old', projectId: project1Id } });

    // Cache it first
    await request(app).get(`/api/tasks/${t.id}`).set('Authorization', 'Bearer valid-token');
    
    const res = await request(app)
      .put(`/api/tasks/${t.id}`)
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'New', status: 'COMPLETED' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('New');
    expect(res.body.data.status).toBe('COMPLETED');

    const cachedTask = await CacheService.get(`tasks:${user1Id}:${t.id}`);
    expect(cachedTask).toBeNull();
  });

  it('should prevent cross-user updates', async () => {
    const t2 = await prisma.task.create({ data: { name: 'User2 Task', projectId: project2Id } });

    const res = await request(app)
      .put(`/api/tasks/${t2.id}`)
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'Hacked' });

    expect(res.status).toBe(404);
  });

  it('should delete a task and invalidate cache', async () => {
    const t = await prisma.task.create({ data: { name: 'To Delete', projectId: project1Id } });

    // cache it
    await request(app).get('/api/tasks').set('Authorization', 'Bearer valid-token');

    const res = await request(app)
      .delete(`/api/tasks/${t.id}`)
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(204);

    const check = await prisma.task.findUnique({ where: { id: t.id }});
    expect(check).toBeNull();

    const cachedList = await CacheService.get(`tasks:${user1Id}:list:{}`);
    expect(cachedList).toBeNull();
  });

  it('should prevent cross-user deletes', async () => {
    const t2 = await prisma.task.create({ data: { name: 'User2 Task', projectId: project2Id } });

    const res = await request(app)
      .delete(`/api/tasks/${t2.id}`)
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(404);

    const check = await prisma.task.findUnique({ where: { id: t2.id }});
    expect(check).toBeDefined();
  });
});
