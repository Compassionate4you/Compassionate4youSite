// DT-765 / DT-771 / DT-781 Sprint 8
// Gandhar Tare
// Tests for the forgot-password, verify-link and reset-password endpoints.
//
// Prisma and the email service are mocked, so these run without a database
// and never send real email.

const crypto = require('crypto');
const request = require('supertest');
const express = require('express');

jest.mock('../../config/db', () => ({
    user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
    },
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed_new_password'),
    compare: jest.fn(),
}));

jest.mock('../../services/notificationService', () => ({
    sendEmail: jest.fn(),
}));

const prisma = require('../../config/db');
const { sendEmail } = require('../../services/notificationService');
const authRoutes = require('../../routes/authRoutes');
const { phoneDigits } = require('../authController');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const alice = { id: 'u1', email: 'alice@example.com', name: 'Alice Smith', phone: '(555) 123-4567' };
const bob = { id: 'u2', email: 'bob@example.com', name: 'Bob Jones', phone: '555.123.4567' };
const carol = { id: 'u3', email: 'carol@example.com', name: 'Carol Lee', phone: '916-555-0000' };

// Pulls the raw token out of the link in the email that was "sent".
function tokenFromSentEmail() {
    const { body } = sendEmail.mock.calls[0][0];
    const match = body.match(/token=([a-f0-9]+)/);
    return match && match[1];
}

beforeEach(() => {
    jest.clearAllMocks();
    sendEmail.mockResolvedValue({ delivered: true, channel: 'email' });
    prisma.user.update.mockResolvedValue({});
});

describe('phoneDigits', () => {
    test('strips formatting so differently typed numbers match', () => {
        expect(phoneDigits('(555) 123-4567')).toBe('5551234567');
        expect(phoneDigits('555.123.4567')).toBe('5551234567');
        expect(phoneDigits('555 123 4567')).toBe('5551234567');
    });

    test('drops a leading US country code', () => {
        expect(phoneDigits('+1 555-123-4567')).toBe('5551234567');
        expect(phoneDigits('15551234567')).toBe('5551234567');
    });
});

describe('POST /api/auth/forgot-password - by email', () => {
    test('sends a reset email to a known account', async () => {
        prisma.user.findUnique.mockResolvedValue(alice);

        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ identifier: 'alice@example.com' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(sendEmail).toHaveBeenCalledTimes(1);

        const sent = sendEmail.mock.calls[0][0];
        expect(sent.to).toBe('alice@example.com');
        expect(sent.subject).toMatch(/reset/i);
        expect(sent.html).toContain('Alice Smith');
        expect(sent.html).toContain('/reset-password?token=');
    });

    test('stores only a hash of the token, with a one hour expiry', async () => {
        prisma.user.findUnique.mockResolvedValue(alice);
        const before = Date.now();

        await request(app)
            .post('/api/auth/forgot-password')
            .send({ identifier: 'alice@example.com' });

        const rawToken = tokenFromSentEmail();
        const { where, data } = prisma.user.update.mock.calls[0][0];

        expect(where).toEqual({ id: 'u1' });
        expect(data.resetToken).toBe(sha256(rawToken));
        expect(data.resetToken).not.toBe(rawToken);

        const expiresIn = data.resetTokenExpiry.getTime() - before;
        expect(expiresIn).toBeGreaterThan(59 * 60 * 1000);
        expect(expiresIn).toBeLessThanOrEqual(60 * 60 * 1000 + 1000);
    });

    test('still accepts the older { email } request body', async () => {
        prisma.user.findUnique.mockResolvedValue(alice);

        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'alice@example.com' });

        expect(res.status).toBe(200);
        expect(sendEmail).toHaveBeenCalledTimes(1);
    });

    test('returns the same generic response for an unknown email and sends nothing', async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ identifier: 'nobody@example.com' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(sendEmail).not.toHaveBeenCalled();
        expect(prisma.user.update).not.toHaveBeenCalled();
    });

    test('rejects input that is neither an email nor a phone number', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ identifier: 'not valid' });

        expect(res.status).toBe(400);
        expect(res.body.error.field).toBe('identifier');
    });

    test('rejects an empty request', async () => {
        const res = await request(app).post('/api/auth/forgot-password').send({});

        expect(res.status).toBe(400);
        expect(res.body.error.field).toBe('identifier');
    });

    test('does not reveal the account when the email fails to send', async () => {
        prisma.user.findUnique.mockResolvedValue(alice);
        sendEmail.mockResolvedValue({ delivered: false, channel: 'email', error: 'boom' });

        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ identifier: 'alice@example.com' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

describe('POST /api/auth/forgot-password - by phone', () => {
    test('emails the account that owns the number, whatever the formatting', async () => {
        prisma.user.findMany.mockResolvedValue([alice, carol]);

        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ identifier: '555-123-4567' });

        expect(res.status).toBe(200);
        expect(sendEmail).toHaveBeenCalledTimes(1);
        // The link goes to the email on the account, never by text.
        expect(sendEmail.mock.calls[0][0].to).toBe('alice@example.com');
    });

    test('returns the generic response when no account has the number', async () => {
        prisma.user.findMany.mockResolvedValue([carol]);

        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ identifier: '(555) 999-9999' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(sendEmail).not.toHaveBeenCalled();
    });

    test('asks for the email when two accounts share the number', async () => {
        prisma.user.findMany.mockResolvedValue([alice, bob]);

        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ identifier: '5551234567' });

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        expect(res.body.error.field).toBe('confirmEmail');
        expect(sendEmail).not.toHaveBeenCalled();
    });

    test('sends only to the confirmed account when two share the number', async () => {
        prisma.user.findMany.mockResolvedValue([alice, bob]);

        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ identifier: '5551234567', confirmEmail: 'BOB@example.com' });

        expect(res.status).toBe(200);
        expect(sendEmail).toHaveBeenCalledTimes(1);
        expect(sendEmail.mock.calls[0][0].to).toBe('bob@example.com');
    });

    test('sends nothing when the confirmed email is not one of the matching accounts', async () => {
        prisma.user.findMany.mockResolvedValue([alice, bob]);

        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ identifier: '5551234567', confirmEmail: 'carol@example.com' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(sendEmail).not.toHaveBeenCalled();
    });

    test('rejects an invalid confirmation email', async () => {
        prisma.user.findMany.mockResolvedValue([alice, bob]);

        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ identifier: '5551234567', confirmEmail: 'nope' });

        expect(res.status).toBe(400);
        expect(res.body.error.field).toBe('confirmEmail');
    });
});

describe('POST /api/auth/reset-password/verify', () => {
    test('returns the name and email for a valid link', async () => {
        prisma.user.findUnique.mockResolvedValue({
            ...alice,
            resetTokenExpiry: new Date(Date.now() + 10 * 60 * 1000),
        });

        const res = await request(app)
            .post('/api/auth/reset-password/verify')
            .send({ token: 'abc123' });

        expect(res.status).toBe(200);
        expect(res.body.user).toEqual({ name: 'Alice Smith', email: 'alice@example.com' });
        // Looked up by the hash, not the raw token.
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { resetToken: sha256('abc123') } });
    });

    test('rejects an expired link', async () => {
        prisma.user.findUnique.mockResolvedValue({
            ...alice,
            resetTokenExpiry: new Date(Date.now() - 1000),
        });

        const res = await request(app)
            .post('/api/auth/reset-password/verify')
            .send({ token: 'abc123' });

        expect(res.status).toBe(400);
        expect(res.body.error.field).toBe('token');
    });

    test('rejects an unknown link', async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/auth/reset-password/verify')
            .send({ token: 'abc123' });

        expect(res.status).toBe(400);
    });

    test('rejects a missing token', async () => {
        const res = await request(app).post('/api/auth/reset-password/verify').send({});

        expect(res.status).toBe(400);
        expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });
});

describe('POST /api/auth/reset-password', () => {
    const validUser = () => ({
        ...alice,
        resetTokenExpiry: new Date(Date.now() + 10 * 60 * 1000),
    });

    test('updates the password, clears the token, and returns the email', async () => {
        prisma.user.findUnique.mockResolvedValue(validUser());

        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'abc123', newPassword: 'NewPass1!' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.email).toBe('alice@example.com');
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 'u1' },
            data: { password: 'hashed_new_password', resetToken: null, resetTokenExpiry: null },
        });
    });

    test('rejects a weak password without touching the account', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'abc123', newPassword: 'weak' });

        expect(res.status).toBe(400);
        expect(res.body.error.field).toBe('newPassword');
        expect(prisma.user.update).not.toHaveBeenCalled();
    });

    test('rejects an expired link', async () => {
        prisma.user.findUnique.mockResolvedValue({
            ...alice,
            resetTokenExpiry: new Date(Date.now() - 1000),
        });

        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'abc123', newPassword: 'NewPass1!' });

        expect(res.status).toBe(400);
        expect(res.body.error.field).toBe('token');
        expect(prisma.user.update).not.toHaveBeenCalled();
    });

    test('rejects a missing token', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ newPassword: 'NewPass1!' });

        expect(res.status).toBe(400);
        expect(res.body.error.field).toBe('token');
    });
});
