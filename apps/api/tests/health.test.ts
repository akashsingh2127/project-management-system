
import request from 'supertest';


import { app } from '../src/app';

describe('Health & Readiness Endpoints', () => {
  it('should return 200 OK for /health', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  it('should return 200 READY for /ready', async () => {
    const response = await request(app).get('/ready');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('READY');
  });
});
