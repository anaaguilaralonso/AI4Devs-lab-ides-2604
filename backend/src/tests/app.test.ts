import request from 'supertest';
import { app } from '../index';
import { prisma } from '../shared/prisma';

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /', () => {
  it('responds with Hello LTI!', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Hello LTI!');
  });
});

describe('POST /api/candidates', () => {
  const uniqueEmail = () => `test-${Date.now()}-${Math.random()}@example.com`;

  it('creates a candidate with valid data', async () => {
    const response = await request(app)
      .post('/api/candidates')
      .field('firstName', 'Ana')
      .field('lastName', 'Garcia')
      .field('email', uniqueEmail());

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Candidate added successfully');
    expect(response.body.firstName).toBe('Ana');
    expect(response.body.lastName).toBe('Garcia');
  });

  it('returns 400 when required fields are missing', async () => {
    const response = await request(app)
      .post('/api/candidates')
      .field('email', uniqueEmail());

    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('returns 400 for invalid email', async () => {
    const response = await request(app)
      .post('/api/candidates')
      .field('firstName', 'Ana')
      .field('lastName', 'Garcia')
      .field('email', 'not-an-email');

    expect(response.statusCode).toBe(400);
    expect(response.body.errors.email).toBeDefined();
  });

  it('returns 409 for duplicate email', async () => {
    const email = uniqueEmail();

    await request(app)
      .post('/api/candidates')
      .field('firstName', 'Ana')
      .field('lastName', 'Garcia')
      .field('email', email);

    const response = await request(app)
      .post('/api/candidates')
      .field('firstName', 'Luis')
      .field('lastName', 'Perez')
      .field('email', email);

    expect(response.statusCode).toBe(409);
    expect(response.body.message).toContain('email');
  });
});
