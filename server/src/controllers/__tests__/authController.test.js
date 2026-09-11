const request = require('supertest');
const express = require('express');

// Mock Prisma before requiring anything that uses it
jest.mock('../../config/db', () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
}));

// Mock bcrypt so tests don't depend on real hashing behavior
jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn(),
}));

const prisma = require('../../config/db');
const bcrypt = require('bcryptjs');
const authRoutes = require('../../routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('POST /api/auth/signup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('rejects an invalid email format', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'not-an-email', password: 'ValidPass1!' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error.field).toBe('email');
    });

    test('rejects a weak password', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'user@example.com', password: 'weak' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error.field).toBe('password');
    });

    test('proceeds normally with valid email and password', async () => {
        prisma.user.findUnique.mockResolvedValue(null); // no existing user
        prisma.user.create.mockResolvedValue({ id: 'abc123', email: 'user@example.com' });

        const res = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'user@example.com', password: 'ValidPass1!' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.userId).toBe('abc123');
    });

    test('error response format is consistent across validation failures', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'bad-email', password: 'weak' });

        expect(res.body).toEqual(
            expect.objectContaining({
                success: false,
                error: expect.objectContaining({
                    message: expect.any(String),
                    field: expect.any(String),
                }),
            })
        );
    });
});

describe('POST /api/auth/login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('rejects an invalid email format', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'not-an-email', password: 'anything' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error.field).toBe('email');
    });

    test('proceeds normally with valid credentials', async () => {
        prisma.user.findUnique.mockResolvedValue({
            id: 'abc123',
            email: 'user@example.com',
            password: 'hashed_password',
        });
        bcrypt.compare.mockResolvedValue(true);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user@example.com', password: 'ValidPass1!' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});