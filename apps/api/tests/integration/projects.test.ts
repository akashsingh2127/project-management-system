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
          sub: 'auth0|project123',
          email: 'test@project.com',
          name: 'Test Project User'
        }
      };
      return next();
    }

    if (token === 'other-user-token') {
      req.auth = {
        payload: {
          sub: 'auth0|project456',
          email: 'other@project.com',
          name: 'Other Project User'
        }
      };
      return next();
    }
    
    return res.status(401).json({ error: 'Unauthorized' });
  }
}));

describe('Project Endpoints', () => {
  let user1Id: string;
  let user2Id: string;

  beforeAll(async () => {
    // Sync users
    await request(app).get('/api/auth/me').set('Authorization', 'Bearer valid-token');
    await request(app).get('/api/auth/me').set('Authorization', 'Bearer other-user-token');

    const user1 = await prisma.user.findUnique({ where: { auth0Subject: 'auth0|project123' }});
    const user2 = await prisma.user.findUnique({ where: { auth0Subject: 'auth0|project456' }});
    user1Id = user1!.id;
    user2Id = user2!.id;
  });

  afterAll(async () => {
    await prisma.project.deleteMany({ where: { userId: { in: [user1Id, user2Id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [user1Id, user2Id] } } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.project.deleteMany({ where: { userId: { in: [user1Id, user2Id] } } });
  });

  it('should require authentication', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(401);
  });

  it('should create a project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', 'Bearer valid-token')
      .send({
        name: 'Test Project',
        description: 'Testing',
        status: 'IN_PROGRESS'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test Project');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('should reject creation with empty name', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', 'Bearer valid-token')
      .send({
        name: '   ',
      });
    
    expect(res.status).toBe(400); // Bad Request (validation)
  });

  it('should validate start and end date', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', 'Bearer valid-token')
      .send({
        name: 'Bad Dates',
        startDate: '2024-01-01',
        endDate: '2023-01-01'
      });
    
    expect(res.status).toBe(400);
  });

  it('should get all projects for a user', async () => {
    await prisma.project.create({ data: { name: 'P1', userId: user1Id } });
    await prisma.project.create({ data: { name: 'P2', userId: user1Id } });

    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('should filter projects by name', async () => {
    await prisma.project.create({ data: { name: 'Alpha', userId: user1Id } });
    await prisma.project.create({ data: { name: 'Beta', userId: user1Id } });

    const res = await request(app)
      .get('/api/projects?name=alpha')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Alpha');
  });

  it('should filter projects by status', async () => {
    await prisma.project.create({ data: { name: 'P1', status: 'NOT_STARTED', userId: user1Id } });
    await prisma.project.create({ data: { name: 'P2', status: 'COMPLETED', userId: user1Id } });

    const res = await request(app)
      .get('/api/projects?status=COMPLETED')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].status).toBe('COMPLETED');
  });

  it('should get a single project by id', async () => {
    const p = await prisma.project.create({ data: { name: 'Single', userId: user1Id } });

    const res = await request(app)
      .get(`/api/projects/${p.id}`)
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Single');
  });

  it('should reject invalid project id format', async () => {
    const res = await request(app)
      .get(`/api/projects/123-invalid-id`)
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(400); // validation error
  });

  it('should not find a non-existent project', async () => {
    const res = await request(app)
      .get(`/api/projects/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(404);
  });

  it('should prevent cross-user access (GET)', async () => {
    const p2 = await prisma.project.create({ data: { name: 'User2 Project', userId: user2Id } });

    const res = await request(app)
      .get(`/api/projects/${p2.id}`)
      .set('Authorization', 'Bearer valid-token'); // user1 requesting user2's project

    expect(res.status).toBe(404); // Returns 404 because findFirst with user1Id doesn't match
  });

  it('should update a project', async () => {
    const p = await prisma.project.create({ data: { name: 'Old', userId: user1Id } });

    const res = await request(app)
      .put(`/api/projects/${p.id}`)
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'New' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('New');
  });

  it('should prevent cross-user updates', async () => {
    const p2 = await prisma.project.create({ data: { name: 'User2 Project', userId: user2Id } });

    const res = await request(app)
      .put(`/api/projects/${p2.id}`)
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'Hacked' });

    expect(res.status).toBe(404);
  });

  it('should delete a project', async () => {
    const p = await prisma.project.create({ data: { name: 'To Delete', userId: user1Id } });

    const res = await request(app)
      .delete(`/api/projects/${p.id}`)
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(204);

    // Verify it's gone
    const check = await prisma.project.findUnique({ where: { id: p.id }});
    expect(check).toBeNull();
  });

  it('should prevent cross-user deletes', async () => {
    const p2 = await prisma.project.create({ data: { name: 'User2 Project', userId: user2Id } });

    const res = await request(app)
      .delete(`/api/projects/${p2.id}`)
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(404);

    // Verify it's still there
    const check = await prisma.project.findUnique({ where: { id: p2.id }});
    expect(check).toBeDefined();
  });
});
