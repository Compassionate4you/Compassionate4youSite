// DT-563 / DT-564: appointment booking and lookup.
const prisma = require('../config/db');
const { sendValidationError } = require('../utils/errorResponse');
const { sendAppointmentConfirmation } = require('../services/notificationService');
const { isValidEmail } = require('../validators/authValidation');

const SERVICE_TYPES = ['Home Health', 'Hospice Care', 'Consultation'];

// Slots the scheduling page offers. Kept here so availability and booking
// agree on one list.
// Must match the options in client/src/pages/SchedulePage.jsx.
const TIME_SLOTS = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isPastDate(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(`${date}T00:00:00`) < today;
}

// GET /api/appointments/availability?date=YYYY-MM-DD
async function getAvailability(req, res, next) {
    try {
        const { date } = req.query;

        if (!DATE_RE.test(String(date || ''))) {
            return sendValidationError(res, 'A date in YYYY-MM-DD format is required.', 'date');
        }

        const taken = await prisma.appointment.findMany({
            where: { date, status: { not: 'CANCELLED' } },
            select: { timeSlot: true },
        });

        const takenSlots = new Set(taken.map((a) => a.timeSlot));

        return res.status(200).json({
            date,
            slots: TIME_SLOTS.map((slot) => ({
                timeSlot: slot,
                available: !takenSlots.has(slot),
            })),
        });
    } catch (err) {
        return next(err);
    }
}

// POST /api/appointments
async function createAppointment(req, res, next) {
    try {
        const { fullName, email, phone, serviceType, date, timeSlot, notes } = req.body || {};

        if (typeof fullName !== 'string' || fullName.trim() === '') {
            return sendValidationError(res, 'Please enter your full name.', 'fullName');
        }
        if (!isValidEmail(email)) {
            return sendValidationError(res, 'Please enter a valid email address.', 'email');
        }
        if (!SERVICE_TYPES.includes(serviceType)) {
            return sendValidationError(res, 'Please choose a service.', 'serviceType');
        }
        if (!DATE_RE.test(String(date || ''))) {
            return sendValidationError(res, 'Please choose a date.', 'date');
        }
        if (isPastDate(date)) {
            return sendValidationError(res, 'Please choose a date in the future.', 'date');
        }
        if (!TIME_SLOTS.includes(timeSlot)) {
            return sendValidationError(res, 'Please choose an available time.', 'timeSlot');
        }

        // DT-563: reject a slot that is already taken.
        const clash = await prisma.appointment.findFirst({
            where: { date, timeSlot, status: { not: 'CANCELLED' } },
        });
        if (clash) {
            return sendValidationError(
                res,
                'That time has just been booked. Please choose another slot.',
                'timeSlot'
            );
        }

        const appointment = await prisma.appointment.create({
            data: {
                userId: req.user?.id ?? null,
                fullName: fullName.trim(),
                email: email.trim(),
                phone: typeof phone === 'string' && phone.trim() !== '' ? phone.trim() : null,
                serviceType,
                date,
                timeSlot,
                notes: typeof notes === 'string' && notes.trim() !== '' ? notes.trim() : null,
            },
        });

        // DT-565 / DT-566: notifications are mocked until providers are wired up.
        await sendAppointmentConfirmation(appointment);

        return res.status(201).json({ success: true, appointment });
    } catch (err) {
        // Unique constraint on (date, timeSlot) - someone booked between the
        // check above and the insert.
        if (err.code === 'P2002') {
            return sendValidationError(
                res,
                'That time has just been booked. Please choose another slot.',
                'timeSlot'
            );
        }
        return next(err);
    }
}

// GET /api/appointments/mine
async function getMyAppointments(req, res, next) {
    try {
        const appointments = await prisma.appointment.findMany({
            where: { userId: req.user.id },
            orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
        });
        return res.status(200).json({ appointments });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createAppointment,
    getAvailability,
    getMyAppointments,
    TIME_SLOTS,
    SERVICE_TYPES,
};
