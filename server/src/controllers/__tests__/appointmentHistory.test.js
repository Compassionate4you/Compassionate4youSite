// DT-837 Sprint 9
// Gandhar Tare
// Tests for admin appointment history: what counts as history (DT-925/926),
// automatic Completed / Not confirmed labels, history tags (DT-927), and
// archiving instead of deleting so history is kept (DT-924).
//
// Prisma, sign-in checks and email are mocked, so these run without a
// database and send nothing.

const request = require('supertest');
const express = require('express');

jest.mock('../../config/db', () => ({
    appointment: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
        delete: jest.fn(),
    },
    user: { findUnique: jest.fn() },
}));

// Lets every request through as a signed-in admin or customer.
jest.mock('../../middleware/authMiddleware', () => ({
    requireAdmin: (req, res, next) => {
        req.user = { id: 'admin1' };
        next();
    },
    requireCustomer: (req, res, next) => {
        req.user = { id: 'cust1' };
        next();
    },
}));

jest.mock('../../services/notificationService', () => ({
    sendAppointmentConfirmation: jest.fn().mockResolvedValue([]),
    notifyAppointmentChange: jest.fn().mockResolvedValue(null),
}));

const prisma = require('../../config/db');
const { notifyAppointmentChange } = require('../../services/notificationService');
const appointmentRoutes = require('../../routes/appointmentRoutes');
const {
    hasStarted,
    isInHistory,
    officeNow,
    slotStartMinutes,
    settlePastAppointments,
} = require('../appointmentController');

const app = express();
app.use(express.json());
app.use('/api/appointments', appointmentRoutes);

// Far from today so the route tests never depend on the clock.
const PAST = '2020-01-15';
const FUTURE = '2099-01-15';

function appt(overrides = {}) {
    return {
        id: 'a1',
        userId: 'cust1',
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: null,
        serviceType: 'Home Health',
        date: FUTURE,
        timeSlot: '10:00 AM',
        notes: null,
        status: 'CONFIRMED',
        historyTag: null,
        archivedAt: null,
        activeSlot: `${FUTURE}|10:00 AM`,
        ...overrides,
    };
}

const validEdit = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    serviceType: 'Home Health',
    date: FUTURE,
    timeSlot: '10:00 AM',
    status: 'CONFIRMED',
};

beforeEach(() => {
    jest.clearAllMocks();
    prisma.appointment.findMany.mockResolvedValue([]);
    prisma.appointment.updateMany.mockResolvedValue({ count: 0 });
    prisma.user.findUnique.mockResolvedValue(null);
});

describe('time helpers (Pacific time)', () => {
    test('reads slot times as minutes since midnight', () => {
        expect(slotStartMinutes('9:00 AM')).toBe(540);
        expect(slotStartMinutes('12:00 PM')).toBe(720);
        expect(slotStartMinutes('3:00 PM')).toBe(900);
        expect(slotStartMinutes('12:00 AM')).toBe(0);
    });

    test('uses the office clock, not UTC', () => {
        // 2026-11-10 05:30 UTC is still 2026-11-09 21:30 in California.
        const office = officeNow(new Date('2026-11-10T05:30:00Z'));
        expect(office.date).toBe('2026-11-09');
        expect(office.minutes).toBe(21 * 60 + 30);
    });

    test('an appointment has started once its start time passes in California', () => {
        const at = (iso) => new Date(iso);
        const tenAm = { date: '2026-11-09', timeSlot: '10:00 AM' };

        // 9:59 AM Pacific (17:59 UTC in November)
        expect(hasStarted(tenAm, at('2026-11-09T17:59:00Z'))).toBe(false);
        // 10:00 AM Pacific
        expect(hasStarted(tenAm, at('2026-11-09T18:00:00Z'))).toBe(true);
        // Next day / previous day
        expect(hasStarted(tenAm, at('2026-11-10T16:00:00Z'))).toBe(true);
        expect(hasStarted(tenAm, at('2026-11-08T23:00:00Z'))).toBe(false);
    });
});

describe('what counts as history (DT-926)', () => {
    test('past appointments are in history', () => {
        expect(isInHistory(appt({ date: PAST }))).toBe(true);
    });

    test('future appointments that are pending or confirmed are current', () => {
        expect(isInHistory(appt({ status: 'PENDING' }))).toBe(false);
        expect(isInHistory(appt({ status: 'CONFIRMED' }))).toBe(false);
    });

    test('a cancelled appointment is in history even before its date', () => {
        expect(isInHistory(appt({ status: 'CANCELLED', date: FUTURE }))).toBe(true);
    });

    test('a completed appointment is in history', () => {
        expect(isInHistory(appt({ status: 'COMPLETED' }))).toBe(true);
    });
});

describe('automatic history labels (DT-925)', () => {
    test('past confirmed appointments become Completed', async () => {
        prisma.appointment.findMany.mockResolvedValueOnce([
            { id: 'c1', date: PAST, timeSlot: '10:00 AM', status: 'CONFIRMED' },
        ]);

        await settlePastAppointments();

        expect(prisma.appointment.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ['c1'] } },
            data: { status: 'COMPLETED', historyTag: 'COMPLETED' },
        });
    });

    test('past pending appointments are tagged Not confirmed and stay Pending', async () => {
        prisma.appointment.findMany.mockResolvedValueOnce([
            { id: 'p1', date: PAST, timeSlot: '10:00 AM', status: 'PENDING' },
        ]);

        await settlePastAppointments();

        expect(prisma.appointment.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ['p1'] } },
            data: { historyTag: 'NOT_CONFIRMED' },
        });
    });

    test('appointments later today are left alone', async () => {
        // Same date as "now", but the slot has not started yet.
        const now = new Date('2026-11-09T17:00:00Z'); // 9:00 AM Pacific
        prisma.appointment.findMany.mockResolvedValueOnce([
            { id: 'later', date: '2026-11-09', timeSlot: '3:00 PM', status: 'CONFIRMED' },
        ]);

        await settlePastAppointments(now);

        expect(prisma.appointment.updateMany).not.toHaveBeenCalled();
    });

    test('only looks at untagged, unarchived appointments up to today', async () => {
        const now = new Date('2026-11-09T17:00:00Z');
        await settlePastAppointments(now);

        expect(prisma.appointment.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: {
                archivedAt: null,
                historyTag: null,
                status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] },
                date: { lte: '2026-11-09' },
            },
        }));
    });
});

describe('GET /api/appointments (admin list)', () => {
    test('splits appointments into current and history and hides archived ones', async () => {
        prisma.appointment.findMany
            .mockResolvedValueOnce([]) // settlePastAppointments
            .mockResolvedValueOnce([
                appt({ id: 'now', date: FUTURE }),
                appt({ id: 'old', date: PAST, status: 'COMPLETED', historyTag: 'COMPLETED' }),
                appt({ id: 'cxl', date: FUTURE, status: 'CANCELLED', historyTag: 'CANCELLED_BY_PATIENT' }),
            ]);

        const res = await request(app).get('/api/appointments');

        expect(res.status).toBe(200);
        const sections = Object.fromEntries(res.body.appointments.map((a) => [a.id, a.section]));
        expect(sections).toEqual({ now: 'current', old: 'history', cxl: 'history' });
        expect(prisma.appointment.findMany).toHaveBeenLastCalledWith(
            expect.objectContaining({ where: { archivedAt: null } })
        );
    });
});

describe('PATCH /api/appointments/:id/history-tag (DT-927)', () => {
    test('changes the tag of an appointment in history and sends no email', async () => {
        prisma.appointment.findUnique.mockResolvedValue(
            appt({ date: PAST, status: 'COMPLETED', historyTag: 'COMPLETED' })
        );
        prisma.appointment.update.mockResolvedValue(
            appt({ date: PAST, status: 'COMPLETED', historyTag: 'NO_SHOW' })
        );

        const res = await request(app)
            .patch('/api/appointments/a1/history-tag')
            .send({ tag: 'NO_SHOW' });

        expect(res.status).toBe(200);
        expect(res.body.appointment.historyTag).toBe('NO_SHOW');
        expect(prisma.appointment.update).toHaveBeenCalledWith({
            where: { id: 'a1' },
            data: { historyTag: 'NO_SHOW' },
        });
        expect(notifyAppointmentChange).not.toHaveBeenCalled();
    });

    test.each(['COMPLETED', 'NO_SHOW', 'CANCELLED_BY_PATIENT', 'CANCELLED_BY_STAFF', 'NOT_CONFIRMED'])(
        'accepts the %s tag',
        async (tag) => {
            prisma.appointment.findUnique.mockResolvedValue(appt({ date: PAST, status: 'COMPLETED' }));
            prisma.appointment.update.mockResolvedValue(appt({ historyTag: tag }));

            const res = await request(app).patch('/api/appointments/a1/history-tag').send({ tag });

            expect(res.status).toBe(200);
        }
    );

    test('rejects a tag that is not on the list', async () => {
        const res = await request(app)
            .patch('/api/appointments/a1/history-tag')
            .send({ tag: 'LATE' });

        expect(res.status).toBe(400);
        expect(res.body.error.field).toBe('tag');
        expect(prisma.appointment.update).not.toHaveBeenCalled();
    });

    test('rejects tagging an appointment that is still current', async () => {
        prisma.appointment.findUnique.mockResolvedValue(appt({ date: FUTURE, status: 'CONFIRMED' }));

        const res = await request(app)
            .patch('/api/appointments/a1/history-tag')
            .send({ tag: 'NO_SHOW' });

        expect(res.status).toBe(400);
        expect(prisma.appointment.update).not.toHaveBeenCalled();
    });

    test('returns 404 for an archived appointment', async () => {
        prisma.appointment.findUnique.mockResolvedValue(appt({ date: PAST, archivedAt: new Date() }));

        const res = await request(app)
            .patch('/api/appointments/a1/history-tag')
            .send({ tag: 'NO_SHOW' });

        expect(res.status).toBe(404);
    });
});

describe('DELETE /api/appointments/:id archives instead of deleting (DT-924)', () => {
    test('marks the appointment archived and frees its slot', async () => {
        prisma.appointment.findUnique.mockResolvedValue(appt());
        prisma.appointment.update.mockResolvedValue(appt({ archivedAt: new Date() }));

        const res = await request(app).delete('/api/appointments/a1');

        expect(res.status).toBe(200);
        expect(prisma.appointment.delete).not.toHaveBeenCalled();
        expect(prisma.appointment.update).toHaveBeenCalledWith({
            where: { id: 'a1' },
            data: { archivedAt: expect.any(Date), activeSlot: null },
        });
    });

    test('returns 404 when the appointment is already archived', async () => {
        prisma.appointment.findUnique.mockResolvedValue(appt({ archivedAt: new Date() }));

        const res = await request(app).delete('/api/appointments/a1');

        expect(res.status).toBe(404);
        expect(prisma.appointment.update).not.toHaveBeenCalled();
    });
});

describe('editing appointments (DT-837)', () => {
    test('appointments in history cannot be edited, only tagged', async () => {
        prisma.appointment.findUnique.mockResolvedValue(appt({ date: PAST, status: 'COMPLETED' }));

        const res = await request(app).patch('/api/appointments/a1').send(validEdit);

        expect(res.status).toBe(400);
        expect(prisma.appointment.update).not.toHaveBeenCalled();
    });

    test('an admin cancelling is tagged Cancelled by staff and frees the slot', async () => {
        prisma.appointment.findUnique.mockResolvedValue(appt());
        prisma.appointment.update.mockResolvedValue(appt({ status: 'CANCELLED' }));

        const res = await request(app)
            .patch('/api/appointments/a1')
            .send({ ...validEdit, status: 'CANCELLED' });

        expect(res.status).toBe(200);
        expect(prisma.appointment.update).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                status: 'CANCELLED',
                historyTag: 'CANCELLED_BY_STAFF',
                activeSlot: null,
            }),
        }));
    });

    test('a normal edit keeps the appointment holding its slot', async () => {
        prisma.appointment.findUnique.mockResolvedValue(appt());
        prisma.appointment.findFirst.mockResolvedValue(null);
        prisma.appointment.update.mockResolvedValue(appt());

        await request(app).patch('/api/appointments/a1').send(validEdit);

        expect(prisma.appointment.update).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                activeSlot: `${FUTURE}|10:00 AM`,
                historyTag: null,
            }),
        }));
    });
});

describe('cancelled appointments are kept (DT-924)', () => {
    test('a patient cancelling is tagged Cancelled by patient and frees the slot', async () => {
        prisma.appointment.findUnique.mockResolvedValue(appt());
        prisma.appointment.update.mockResolvedValue(appt({ status: 'CANCELLED' }));

        const res = await request(app).patch('/api/appointments/a1/cancel');

        expect(res.status).toBe(200);
        expect(prisma.appointment.update).toHaveBeenCalledWith({
            where: { id: 'a1' },
            data: { status: 'CANCELLED', historyTag: 'CANCELLED_BY_PATIENT', activeSlot: null },
        });
    });

    test('booking a slot freed by a cancellation never deletes the cancelled appointment', async () => {
        prisma.appointment.findFirst.mockResolvedValue(null);
        prisma.appointment.create.mockResolvedValue(appt());

        const res = await request(app).post('/api/appointments').send({
            fullName: 'New Person',
            email: 'new@example.com',
            serviceType: 'Home Health',
            date: FUTURE,
            timeSlot: '10:00 AM',
        });

        expect(res.status).toBe(201);
        expect(prisma.appointment.deleteMany).not.toHaveBeenCalled();
        expect(prisma.appointment.findFirst).toHaveBeenCalledWith({
            where: { activeSlot: `${FUTURE}|10:00 AM` },
        });
        expect(prisma.appointment.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ activeSlot: `${FUTURE}|10:00 AM` }),
        }));
    });

    test('availability only counts appointments that still hold their slot', async () => {
        prisma.appointment.findMany.mockResolvedValue([{ timeSlot: '9:00 AM' }]);

        const res = await request(app).get(`/api/appointments/availability?date=${FUTURE}`);

        expect(prisma.appointment.findMany).toHaveBeenCalledWith({
            where: { date: FUTURE, activeSlot: { not: null } },
            select: { timeSlot: true },
        });
        const nine = res.body.slots.find((s) => s.timeSlot === '9:00 AM');
        expect(nine.available).toBe(false);
    });
});

describe('customers never see history fields', () => {
    test('GET /mine leaves out the tag and archive fields', async () => {
        prisma.appointment.findMany
            .mockResolvedValueOnce([]) // settlePastAppointments
            .mockResolvedValueOnce([appt({ date: PAST, status: 'COMPLETED', historyTag: 'NO_SHOW' })]);

        const res = await request(app).get('/api/appointments/mine');

        expect(res.status).toBe(200);
        const [mine] = res.body.appointments;
        expect(mine.status).toBe('COMPLETED');
        expect(mine).not.toHaveProperty('historyTag');
        expect(mine).not.toHaveProperty('archivedAt');
        expect(mine).not.toHaveProperty('activeSlot');
    });

    test('GET /mine hides appointments the office archived', async () => {
        prisma.appointment.findMany
            .mockResolvedValueOnce([]) // settlePastAppointments
            .mockResolvedValueOnce([]);

        await request(app).get('/api/appointments/mine');

        const listCall = prisma.appointment.findMany.mock.calls[1][0];
        expect(listCall.where).toEqual(expect.objectContaining({ archivedAt: null }));
    });
});

describe('admin create and edit say which tab the appointment belongs in', () => {
    test('an edit that cancels the appointment moves it to history', async () => {
        prisma.appointment.findUnique.mockResolvedValue(appt());
        prisma.appointment.update.mockResolvedValue(appt({ status: 'CANCELLED', activeSlot: null }));

        const res = await request(app)
            .patch('/api/appointments/a1')
            .send({ ...validEdit, status: 'CANCELLED' });

        expect(res.body.appointment.section).toBe('history');
    });

    test('a new future confirmed appointment is current', async () => {
        prisma.appointment.findFirst.mockResolvedValue(null);
        prisma.appointment.create.mockResolvedValue(appt());

        const res = await request(app).post('/api/appointments/admin').send(validEdit);

        expect(res.status).toBe(201);
        expect(res.body.appointment.section).toBe('current');
    });
});
