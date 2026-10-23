// DT-563 / DT-564: appointment booking and lookup.
const prisma = require('../config/db');
const { sendValidationError } = require('../utils/errorResponse');
const { sendAppointmentConfirmation } = require('../services/notificationService');
const { isValidEmail } = require('../validators/authValidation');

const SERVICE_TYPES = ['Home Health', 'Hospice Care', 'Consultation'];

const APPOINTMENT_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', ];

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

        // DT-565 / DT-566: a failed notification must not lose the booking.
        try {
            await sendAppointmentConfirmation(appointment);
        } catch (notifyErr) {
            // eslint-disable-next-line no-console
            console.error('Appointment saved but notification failed:', notifyErr.message);
        }

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

// Returns every appointment for the Admin Dashboard.
async function getAllAppointments(req, res, next) {
    try {
        const appointments = await prisma.appointment.findMany({
            orderBy: [
                { date: 'asc' },
                { timeSlot: 'asc' },
            ],
        });

        return res.status(200).json({ appointments });
    } catch (err) {
        return next(err);
    }
}

// POST /api/appointments/admin
// Allows an administrator to create an appointment
async function createAdminAppointment(req, res, next) {
    try {
        const {
            fullName,
            email,
            phone,
            serviceType,
            date,
            timeSlot,
            status,
            notes,
        } = req.body || {};

        if (typeof fullName !== 'string' || fullName.trim() === '') {
            return sendValidationError(
                res,
                'Please enter the patient name.',
                'fullName'
            );
        }

        if (!isValidEmail(email)) {
            return sendValidationError(
                res,
                'Please enter a valid email address.',
                'email'
            );
        }

        if (!SERVICE_TYPES.includes(serviceType)) {
            return sendValidationError(
                res,
                'Please choose a valid service.',
                'serviceType'
            );
        }

        if (!DATE_RE.test(String(date || ''))) {
            return sendValidationError(
                res,
                'Please choose a valid date.',
                'date'
            );
        }

        if (isPastDate(date)) {
            return sendValidationError(
                res,
                'Please choose a date in the future.',
                'date'
            );
        }

        if (!TIME_SLOTS.includes(timeSlot)) {
            return sendValidationError(
                res,
                'Please choose a valid appointment time.',
                'timeSlot'
            );
        }

        const normalizedStatus = String(status || '').toUpperCase();

        if (!APPOINTMENT_STATUSES.includes(normalizedStatus)) {
            return sendValidationError(
                res,
                'Please choose a valid appointment status.',
                'status'
            );
        }

        const clash = await prisma.appointment.findFirst({
            where: {
                date,
                timeSlot,
                status: { not: 'CANCELLED' },
            },
        });

        if (clash) {
            return sendValidationError(
                res,
                'An appointment already exists at that date and time.',
                'timeSlot'
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        const matchingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true },
        });

        const appointment = await prisma.appointment.create({
            data: {
                fullName: fullName.trim(),
                email: normalizedEmail,
                phone:
                    typeof phone === 'string' && phone.trim() !== ''
                        ? phone.trim()
                        : null,
                serviceType,
                date,
                timeSlot,
                status: normalizedStatus,
                notes:
                    typeof notes === 'string' && notes.trim() !== ''
                        ? notes.trim()
                        : null,

                // An Admin-created appointment may not belong to an
                // existing customer account.
                userId: matchingUser?.id ?? null,
            },
        });

        return res.status(201).json({
            success: true,
            appointment,
        });
    } catch (err) {
        if (err.code === 'P2002') {
            return sendValidationError(
                res,
                'An appointment already exists at that date and time.',
                'timeSlot'
            );
        }

        return next(err);
    }
}

// PATCH /api/appointments/:id
// Allows an administrator to update an appointment
async function updateAdminAppointment(req, res, next) {
    try {
        const { id } = req.params;

        const {
            fullName,
            email,
            phone,
            serviceType,
            date,
            timeSlot,
            status,
            notes,
        } = req.body || {};

        const existingAppointment =
            await prisma.appointment.findUnique({
                where: { id },
            });

        if (!existingAppointment) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Appointment not found.',
                    field: null,
                },
            });
        }

        if (
            typeof fullName !== 'string' ||
            fullName.trim() === ''
        ) {
            return sendValidationError(
                res,
                'Please enter the patient name.',
                'fullName'
            );
        }

        if (!isValidEmail(email)) {
            return sendValidationError(
                res,
                'Please enter a valid email address.',
                'email'
            );
        }

        if (!SERVICE_TYPES.includes(serviceType)) {
            return sendValidationError(
                res,
                'Please choose a valid service.',
                'serviceType'
            );
        }

        if (!DATE_RE.test(String(date || ''))) {
            return sendValidationError(
                res,
                'Please choose a valid date.',
                'date'
            );
        }

        if (!TIME_SLOTS.includes(timeSlot)) {
            return sendValidationError(
                res,
                'Please choose a valid appointment time.',
                'timeSlot'
            );
        }

        const normalizedStatus =
            String(status || '').toUpperCase();

        if (!APPOINTMENT_STATUSES.includes(normalizedStatus)) {
            return sendValidationError(
                res,
                'Please choose a valid appointment status.',
                'status'
            );
        }

        // Exclude the appointment currently being edited when
        // checking for another appointment at the same date and time.
        const clash = await prisma.appointment.findFirst({
            where: {
                id: { not: id },
                date,
                timeSlot,
                status: { not: 'CANCELLED' },
            },
        });

        if (clash) {
            return sendValidationError(
                res,
                'Another appointment already exists at that date and time.',
                'timeSlot'
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Link the appointment to an existing customer when possible.
        const matchingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true },
        });

        const updatedAppointment =
            await prisma.appointment.update({
                where: { id },
                data: {
                    fullName: fullName.trim(),
                    email: normalizedEmail,
                    phone:
                        typeof phone === 'string' &&
                        phone.trim() !== ''
                            ? phone.trim()
                            : null,
                    serviceType,
                    date,
                    timeSlot,
                    status: normalizedStatus,
                    notes:
                        typeof notes === 'string' &&
                        notes.trim() !== ''
                            ? notes.trim()
                            : null,
                    userId: matchingUser?.id ?? null,
                },
            });

        return res.status(200).json({
            success: true,
            appointment: updatedAppointment,
        });
    } catch (err) {
        if (err.code === 'P2002') {
            return sendValidationError(
                res,
                'Another appointment already exists at that date and time.',
                'timeSlot'
            );
        }

        return next(err);
    }
}

// DELETE /api/appointments/:id
// Permanently deletes an appointment.
async function deleteAdminAppointment(req, res, next) {
    try {
        const { id } = req.params;

        const existingAppointment =
            await prisma.appointment.findUnique({
                where: { id },
            });

        if (!existingAppointment) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Appointment not found.',
                    field: null,
                },
            });
        }

        await prisma.appointment.delete({
            where: { id },
        });

        return res.status(200).json({
            success: true,
            appointmentId: id,
        });
    } catch (err) {
        // The appointment may have been deleted by another request
        // after the initial existence check.
        if (err.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Appointment not found.',
                    field: null,
                },
            });
        }

        return next(err);
    }
}

// DT-278 (721): PATCH /api/appointments/:id/cancel
// Cancels one of the signed in user's appointments from the Customer Portal.
async function cancelAppointment(req, res, next) {
    try {
        // Find the appointment using the id from the URL
        const appointment = await prisma.appointment.findUnique({
            where: { id: req.params.id },
        });

        // DT-278 (723): Only the person who booked it can cancel it.
        // Sends "not found" instead of "not allowed" so people can't tell
        // whether someone else's appointment id exists.
        if (!appointment || appointment.userId !== req.user.id) {
            return res.status(404).json({
                success: false,
                error: { message: 'Appointment not found.', field: null },
            });
        }

        // Already cancelled, so there's nothing to change
        if (appointment.status === 'CANCELLED') {
            return res.status(200).json({ success: true, appointment });
        }

        // Can't cancel an appointment that already happened
        if (appointment.status === 'COMPLETED' || isPastDate(appointment.date)) {
            return sendValidationError(res, 'This appointment has already happened.', null);
        }

        // Mark it as cancelled instead of deleting it,
        // so it still shows in the Past tab on the customer portal
        const updated = await prisma.appointment.update({
            where: { id: appointment.id },
            data: { status: 'CANCELLED' },
        });

        // Send back the updated appointment so the portal can show the new status
        return res.status(200).json({ success: true, appointment: updated });
    } catch (err) {
        return next(err);
    }
}

// DT-278 (722): PATCH /api/appointments/:id/reschedule
// Moves one of the signed in user's appointments to a new date and time.
// Body: { date: 'YYYY-MM-DD', timeSlot: '10:00 AM' }
async function rescheduleAppointment(req,res,next){
    try{
        const { date, timeSlot } = req.body || {};

        // find the appointment using the id from the URL
        const appointment = await prisma.appointment.findUnique({
            where: { id: req.params.id },
        });

        // DT-278 (723): Only the person who booked it can reschedule it.
        // Same "not found" message as cancel so other users' ids stay hidden.
        if(!appointment || appointment.userId !== req.user.id){
            return res.status(404).json({
                success: false,
                error: { message: 'Appointment not found.', field: null },
            });
        }

        // Can't reschedule one appt that is cancelled or already happened
        if(appointment.status === 'CANCELLED'){
            return sendValidationError(res, 'This appointment was cancelled. Please book a new one.', null);
        }
        if(appointment.status === 'COMPLETED' || isPastDate(appointment.date)){
            return sendValidationError(res, 'This appointment has already happened.', null);
        }

        // DT-278 (722): Same date and time checks as booking (createAppointment)
        if (!DATE_RE.test(String(date || ''))){
            return sendValidationError(res, 'Please choose a date.', 'date');
        }
        if(isPastDate(date)){
            return sendValidationError(res, 'Please choose a date in the future.', 'date');
        }
        if (!TIME_SLOTS.includes(timeSlot)){
            return sendValidationError(res, 'Please choose an available time.', 'timeSlot');
        }

        // Nothing to change if they picked the same date and time
        if (appointment.date === date && appointment.timeSlot === timeSlot){
            return res.status(200).json({ success: true, appointment });
        }

        // DT-278 (722): Make sure the new slot isn't taken.
        // Leaves out this appointment itself and cancelled ones.
        const clash = await prisma.appointment.findFirst({
            where: {
                id: { not: appointment.id },
                date,
                timeSlot,
                status: { not: 'CANCELLED' },
            },
        });
        if(clash){
            return sendValidationError(res,'That time is already booked. Please choose another time slot.', 'timeSlot');
        }

        // Save the new date and time. Status goes back to PENDING
        // so staff/admin can confirm the new time.
        const updated=await prisma.appointment.update({
            where: { id: appointment.id },
            data: { date, timeSlot, status: 'PENDING' },
        });

        // Send back the updated appointment so the portal can show the new date and time
        return res.status(200).json({ success: true, appointment: updated });
    } catch (err) {
        // Unique rule on (date, timeSlot). This also happens when a cancelled
        // appointment still holds the slot (DT-724).
        if (err.code === 'P2002') {
            return sendValidationError(res, 'That time is already booked. Please choose another slot.', 'timeSlot');
        }
        return next(err);
    }   
}

module.exports = {
    createAppointment,
    createAdminAppointment,
    getAvailability,
    getMyAppointments,
    getAllAppointments,
    updateAdminAppointment,
    deleteAdminAppointment,
    // DT-278 (721): cancel route
    cancelAppointment,
    // DT-278 (722): reschedule route
    rescheduleAppointment,
    TIME_SLOTS,
    SERVICE_TYPES,
};
