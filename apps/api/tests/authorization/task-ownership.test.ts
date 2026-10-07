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

describe('Task Authorization', () => {
  let userA: any;
  let userB: any;
  let projectB: any;
  let taskB: any;

  beforeAll(async () => {
    // Clean up
    await prisma.user.deleteMany({
      where: { auth0Subject: { in: ['auth0|userA-task', 'auth0|userB-task'] } }
    });

    userA = await prisma.user.create({
      data: { auth0Subject: 'auth0|userA-task', email: 'atask@test.com', fullName: 'User A Task' }
    });

    userB = await prisma.user.create({
      data: { auth0Subject: 'auth0|userB-task', email: 'btask@test.com', fullName: 'User B Task' }
    });

    projectB = await prisma.project.create({
      data: {
        name: 'Project B',
        userId: userB.id
      }
    });

    taskB = await prisma.task.create({
      data: {
        name: 'Task B',
        projectId: projectB.id
      }
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { auth0Subject: { in: ['auth0|userA-task', 'auth0|userB-task'] } }
    });
    await prisma.$disconnect();
  });

  it('User A accesses User B task -> denied', async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskB.id}`)
      .set('x-mock-user-id', userA.id);
    
    expect(res.status).toBe(404);
  });

  it('User A updates User B task -> denied', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskB.id}`)
      .set('x-mock-user-id', userA.id)
      .send({ name: 'Hacked Task' });
    
    expect(res.status).toBe(404);
  });

  it('User A deletes User B task -> denied', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskB.id}`)
      .set('x-mock-user-id', userA.id);
    
    expect(res.status).toBe(404);
  });

  it('User A creates task in User B project -> denied', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('x-mock-user-id', userA.id)
      .send({
        name: 'Malicious Task',
        projectId: projectB.id
      });
    
    expect(res.status).toBe(404);
  });
});
