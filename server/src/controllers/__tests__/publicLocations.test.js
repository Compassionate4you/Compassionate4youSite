// DT-909 / DT-910 Sprint 9
// Gandhar Tare
// The landing page reads locations from GET /api/locations without signing
// in. These tests make sure that stays public and returns locations by name,
// while adding and deleting stay admin-only. Prisma is mocked.

const request = require('supertest');
const express = require('express');

jest.mock('../../config/db', () => ({
    location: {
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
}));

// Signed-out visitor: admin-only routes refuse.
jest.mock('../../middleware/authMiddleware', () => ({
    requireAdmin: (req, res) => res.status(401).json({ success: false }),
    requireCustomer: (req, res) => res.status(401).json({ success: false }),
}));

const prisma = require('../../config/db');
const locationRoutes = require('../../routes/locationRoutes');

const app = express();
app.use(express.json());
app.use('/api/locations', locationRoutes);

beforeEach(() => jest.clearAllMocks());

describe('GET /api/locations (used by the landing page)', () => {
    test('works for a signed-out visitor', async () => {
        prisma.location.findMany.mockResolvedValue([
            { id: '1', name: 'Walnut Creek Office', streetAddress: '1501 N Broadway', city: 'Walnut Creek', state: 'CA', zipCode: '94596' },
        ]);

        const res = await request(app).get('/api/locations');

        expect(res.status).toBe(200);
        expect(res.body.locations).toHaveLength(1);
        expect(res.body.locations[0].name).toBe('Walnut Creek Office');
    });

    test('asks the database for the locations sorted by name', async () => {
        prisma.location.findMany.mockResolvedValue([]);

        await request(app).get('/api/locations');

        expect(prisma.location.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ orderBy: { name: 'asc' } })
        );
    });
});

describe('changing locations stays admin-only', () => {
    test('a signed-out visitor cannot add a location', async () => {
        const res = await request(app).post('/api/locations').send({ name: 'X' });

        expect(res.status).toBe(401);
        expect(prisma.location.create).not.toHaveBeenCalled();
    });

    test('a signed-out visitor cannot delete a location', async () => {
        const res = await request(app).delete('/api/locations/1');

        expect(res.status).toBe(401);
        expect(prisma.location.delete).not.toHaveBeenCalled();
    });
});
