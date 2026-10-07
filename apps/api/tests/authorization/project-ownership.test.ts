import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/config/database';

jest.mock('../../src/middlewares/auth0', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    // Mock user attached by auth0
    req.user = { id: req.headers['x-mock-user-id'] };
    next();
  }
}));

describe('Project Authorization', () => {
  let userA: any;
  let userB: any;
  let projectB: any;

  beforeAll(async () => {
    // Clean up
    await prisma.user.deleteMany({
      where: { auth0Subject: { in: ['auth0|userA', 'auth0|userB'] } }
    });

    userA = await prisma.user.create({
      data: { auth0Subject: 'auth0|userA', email: 'a@test.com', fullName: 'User A' }
    });

    userB = await prisma.user.create({
      data: { auth0Subject: 'auth0|userB', email: 'b@test.com', fullName: 'User B' }
    });

    projectB = await prisma.project.create({
      data: {
        name: 'Project B',
        userId: userB.id
      }
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { auth0Subject: { in: ['auth0|userA', 'auth0|userB'] } }
    });
    await prisma.$disconnect();
  });

  it('Missing authentication -> 401', async () => {
    // With no mock user header, requireOwnership should block it
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(401);
  });

  it('User A accesses own project -> allowed', async () => {
    const projectA = await prisma.project.create({
      data: { name: 'Project A', userId: userA.id }
    });

    const res = await request(app)
      .get(`/api/projects/${projectA.id}`)
      .set('x-mock-user-id', userA.id);
    
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(projectA.id);
  });

  it('User A accesses User B project -> denied (404 to avoid leaking)', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectB.id}`)
      .set('x-mock-user-id', userA.id);
    
    expect(res.status).toBe(404);
  });

  it('User A updates User B project -> denied', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectB.id}`)
      .set('x-mock-user-id', userA.id)
      .send({ name: 'Hacked Project' });
    
    expect(res.status).toBe(404);
  });

  it('User A deletes User B project -> denied', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectB.id}`)
      .set('x-mock-user-id', userA.id);
    
    expect(res.status).toBe(404);
  });
});
