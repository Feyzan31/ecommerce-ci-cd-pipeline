const request = require('supertest');
const app = require('../src/index');

describe('GET /api/products', () => {
  it('returns products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
