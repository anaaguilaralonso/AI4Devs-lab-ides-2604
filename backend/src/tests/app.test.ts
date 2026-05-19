import fs from 'fs';
import request from 'supertest';
import { app } from '../index';
import { UPLOAD_DIR } from '../features/candidates/candidate.upload';
import { prisma } from '../shared/prisma';

function countCvFiles(): number {
  if (!fs.existsSync(UPLOAD_DIR)) {
    return 0;
  }
  return fs.readdirSync(UPLOAD_DIR).length;
}

function pdfAttachment() {
  return {
    filename: 'resume.pdf',
    contentType: 'application/pdf',
  };
}

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

  it('creates a candidate with a PDF CV and stores metadata', async () => {
    const email = uniqueEmail();

    const response = await request(app)
      .post('/api/candidates')
      .field('firstName', 'Jane')
      .field('lastName', 'Doe')
      .field('email', email)
      .attach('cv', Buffer.from('%PDF-1.4 test'), pdfAttachment());

    expect(response.statusCode).toBe(201);

    const candidate = await prisma.candidate.findUnique({ where: { email } });
    expect(candidate?.cvFileName).toBe('resume.pdf');
    expect(candidate?.cvPath).toBeTruthy();
    expect(candidate?.cvMimeType).toBe('application/pdf');
  });

  it('returns 400 for disallowed CV file type', async () => {
    const response = await request(app)
      .post('/api/candidates')
      .field('firstName', 'Jane')
      .field('lastName', 'Doe')
      .field('email', uniqueEmail())
      .attach('cv', Buffer.from('not a pdf'), {
        filename: 'resume.exe',
        contentType: 'application/octet-stream',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Only PDF or DOCX files are allowed');
  });

  it('returns 400 when CV exceeds 5 MB', async () => {
    const oversized = Buffer.alloc(5 * 1024 * 1024 + 1);

    const response = await request(app)
      .post('/api/candidates')
      .field('firstName', 'Jane')
      .field('lastName', 'Doe')
      .field('email', uniqueEmail())
      .attach('cv', oversized, pdfAttachment());

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('File size must not exceed 5 MB');
  });

  it('normalizes email to lowercase before saving', async () => {
    const email = `User-${Date.now()}@Example.COM`;
    const normalized = email.toLowerCase();

    const response = await request(app)
      .post('/api/candidates')
      .field('firstName', 'Jane')
      .field('lastName', 'Doe')
      .field('email', email);

    expect(response.statusCode).toBe(201);
    expect(response.body.email).toBe(normalized);

    const candidate = await prisma.candidate.findUnique({
      where: { email: normalized },
    });
    expect(candidate).not.toBeNull();
  });

  it('removes uploaded CV file when duplicate email returns 409', async () => {
    const email = uniqueEmail();
    const filesAfterFirst = async () => {
      await request(app)
        .post('/api/candidates')
        .field('firstName', 'First')
        .field('lastName', 'User')
        .field('email', email)
        .attach('cv', Buffer.from('%PDF-1.4 first'), pdfAttachment());
      return countCvFiles();
    };

    const countAfterSuccess = await filesAfterFirst();

    const response = await request(app)
      .post('/api/candidates')
      .field('firstName', 'Second')
      .field('lastName', 'User')
      .field('email', email)
      .attach('cv', Buffer.from('%PDF-1.4 second'), {
        filename: 'second.pdf',
        contentType: 'application/pdf',
      });

    expect(response.statusCode).toBe(409);
    expect(countCvFiles()).toBe(countAfterSuccess);
  });
});
