// DT-563 / DT-564: appointment booking and lookup.
const prisma = require('../config/db');
const { sendValidationError } = require('../utils/errorResponse');
const { sendAppointmentConfirmation, notifyAppointmentChange } = require('../services/notificationService');
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

// DT-837 / DT-927: the labels an admin can give an appointment in history.
const HISTORY_TAGS = [
    'COMPLETED',
    'NO_SHOW',
    'CANCELLED_BY_PATIENT',
    'CANCELLED_BY_STAFF',
    'NOT_CONFIRMED',
];

// DT-837 / DT-925: "has this appointment happened yet" is judged in the
// office's time zone, not the server's.
const OFFICE_TIME_ZONE = 'America/Los_Angeles';

// DT-837 / DT-924: value of activeSlot while an appointment holds its slot.
function slotKey(date, timeSlot) {
    return `${date}|${timeSlot}`;
}

// DT-837: today's date (YYYY-MM-DD) and minutes since midnight in the office.
function officeNow(now = new Date()) {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-CA', {
            timeZone: OFFICE_TIME_ZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
        })
            .formatToParts(now)
            .map((p) => [p.type, p.value])
    );
    return {
        date: `${parts.year}-${parts.month}-${parts.day}`,
        minutes: Number(parts.hour) * 60 + Number(parts.minute),
    };
}

// DT-837: '10:00 AM' -> 600. Unknown formats count as the start of the day.
function slotStartMinutes(timeSlot) {
    const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(timeSlot || '').trim());
    if (!match) return 0;
    let hours = Number(match[1]) % 12;
    if (match[3].toUpperCase() === 'PM') hours += 12;
    return hours * 60 + Number(match[2]);
}

// DT-837 / DT-925: true once the appointment's start time has passed.
function hasStarted(appointment, now = new Date()) {
    const office = officeNow(now);
    if (appointment.date < office.date) return true;
    if (appointment.date > office.date) return false;
    return slotStartMinutes(appointment.timeSlot) <= office.minutes;
}

// DT-837 / DT-926: an appointment belongs in history once it has happened,
// or as soon as it is cancelled or completed.
function isInHistory(appointment, now = new Date()) {
    return (
        appointment.status === 'CANCELLED' ||
        appointment.status === 'COMPLETED' ||
        hasStarted(appointment, now)
    );
}

// DT-837 / DT-925 / DT-926: give past appointments their history label.
// Confirmed ones become Completed; ones nobody confirmed are tagged
// Not confirmed and keep their Pending status. Runs whenever appointments are
// listed, so no scheduled job is needed.
async function settlePastAppointments(now = new Date()) {
    const office = officeNow(now);
    const candidates = await prisma.appointment.findMany({
        where: {
            archivedAt: null,
            historyTag: null,
            status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] },
            date: { lte: office.date },
        },
        select: { id: true, date: true, timeSlot: true, status: true },
    });

    const toComplete = [];
    const notConfirmed = [];
    for (const appt of candidates) {
        if (appt.status === 'COMPLETED') toComplete.push(appt.id);
        else if (hasStarted(appt, now)) {
            (appt.status === 'CONFIRMED' ? toComplete : notConfirmed).push(appt.id);
        }
    }

    if (toComplete.length > 0) {
        await prisma.appointment.updateMany({
            where: { id: { in: toComplete } },
            data: { status: 'COMPLETED', historyTag: 'COMPLETED' },
        });
    }
    if (notConfirmed.length > 0) {
        await prisma.appointment.updateMany({
            where: { id: { in: notConfirmed } },
            data: { historyTag: 'NOT_CONFIRMED' },
        });
    }
}

// DT-837: history fields are admin-only, so customers never receive them.
function forCustomer(appointment) {
    const { historyTag, archivedAt, activeSlot, ...rest } = appointment;
    return rest;
}

// DT-837: the history label that goes with a status an admin sets.
// Pending and Confirmed have none until the appointment is in the past.
function historyTagForStatus(status) {
    if (status === 'CANCELLED') return 'CANCELLED_BY_STAFF';
    if (status === 'COMPLETED') return 'COMPLETED';
    return null;
}

function isPastDate(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(`${date}T00:00:00`) < today;
}

// DT-278 (724) used to delete a cancelled appointment when its slot was
// booked again. DT-837 replaced that: cancelled appointments give up their
// activeSlot instead, so the slot frees up and the appointment stays in history.

// GET /api/appointments/availability?date=YYYY-MM-DD
async function getAvailability(req, res, next) {
    try {
        const { date } = req.query;

        if (!DATE_RE.test(String(date || ''))) {
            return sendValidationError(res, 'A date in YYYY-MM-DD format is required.', 'date');
        }

        // DT-837: only appointments still holding their slot count as taken
        // (cancelled and archived ones have activeSlot cleared).
        const taken = await prisma.appointment.findMany({
            where: { date, activeSlot: { not: null } },
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
            where: { activeSlot: slotKey(date, timeSlot) },
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
                // DT-837: the new booking holds its slot.
                activeSlot: slotKey(date, timeSlot),
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
        // Unique constraint on activeSlot - someone booked between the
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
        // DT-837: mark past appointments Completed before showing them.
        await settlePastAppointments();
        const appointments = await prisma.appointment.findMany({
            // DT-924: an appointment the office archived is hidden from the
            // patient too, as it was when archiving was a delete.
            where: { userId: req.user.id, archivedAt: null },
            orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
        });
        return res.status(200).json({ appointments: appointments.map(forCustomer) });
    } catch (err) {
        return next(err);
    }
}

// Returns every appointment for the Admin Dashboard.
// DT-837: archived appointments are left out, and each one says whether it
// belongs in the Current or History tab.
async function getAllAppointments(req, res, next) {
    try {
        await settlePastAppointments();

        const appointments = await prisma.appointment.findMany({
            where: { archivedAt: null },
            orderBy: [
                { date: 'asc' },
                { timeSlot: 'asc' },
            ],
        });

        const now = new Date();
        return res.status(200).json({
            appointments: appointments.map((appointment) => ({
                ...appointment,
                section: isInHistory(appointment, now) ? 'history' : 'current',
            })),
        });
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

        // DT-837: a cancelled appointment does not take up the slot.
        const clash = normalizedStatus === 'CANCELLED'
            ? null
            : await prisma.appointment.findFirst({
                where: { activeSlot: slotKey(date, timeSlot) },
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
                // DT-837: slot and history label follow the status.
                activeSlot: normalizedStatus === 'CANCELLED' ? null : slotKey(date, timeSlot),
                historyTag: historyTagForStatus(normalizedStatus),
                notes:
                    typeof notes === 'string' && notes.trim() !== ''
                        ? notes.trim()
                        : null,

                // An Admin-created appointment may not belong to an
                // existing customer account.
                userId: matchingUser?.id ?? null,
            },
        });
        // Tell the person: confirmed if staff booked it as confirmed, otherwise
        // a request awaiting approval. A failed send never blocks the booking.
        await notifyAppointmentChange(null, appointment);
        return res.status(201).json({
            success: true,
            // DT-837: tells the dashboard which tab the appointment belongs in.
            appointment: { ...appointment, section: isInHistory(appointment) ? 'history' : 'current' },
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

        if (!existingAppointment || existingAppointment.archivedAt) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Appointment not found.',
                    field: null,
                },
            });
        }

        // DT-837: appointments in history are a record of what happened.
        // Only their tag can change (PATCH /:id/history-tag).
        if (isInHistory(existingAppointment)) {
            return sendValidationError(
                res,
                'Appointments in history can only have their tag changed.',
                null
            );
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
        // DT-837: cancelling it frees the slot, so there is nothing to check.
        const clash = normalizedStatus === 'CANCELLED'
            ? null
            : await prisma.appointment.findFirst({
                where: {
                    id: { not: id },
                    activeSlot: slotKey(date, timeSlot),
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
                    // DT-837: an admin cancelling is tagged Cancelled by staff
                    // and gives up the slot.
                    activeSlot: normalizedStatus === 'CANCELLED' ? null : slotKey(date, timeSlot),
                    historyTag: historyTagForStatus(normalizedStatus),
                    notes:
                        typeof notes === 'string' &&
                        notes.trim() !== ''
                            ? notes.trim()
                            : null,
                    userId: matchingUser?.id ?? null,
                },
            });
        // Email the person when the status or the date/time changed
        // (confirmed, rescheduled or cancelled). Never throws.
        await notifyAppointmentChange(existingAppointment, updatedAppointment);
        return res.status(200).json({
            success: true,
            // DT-837: an appointment cancelled or completed here moves to History.
            appointment: {
                ...updatedAppointment,
                section: isInHistory(updatedAppointment) ? 'history' : 'current',
            },
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
// DT-837 / DT-924: archives the appointment instead of deleting it, so the
// history is kept. It disappears from the admin lists and frees its slot.
async function deleteAdminAppointment(req, res, next) {
    try {
        const { id } = req.params;

        const existingAppointment =
            await prisma.appointment.findUnique({
                where: { id },
            });

        if (!existingAppointment || existingAppointment.archivedAt) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Appointment not found.',
                    field: null,
                },
            });
        }

        await prisma.appointment.update({
            where: { id },
            data: { archivedAt: new Date(), activeSlot: null },
        });

        return res.status(200).json({
            success: true,
            appointmentId: id,
        });
    } catch (err) {
        // The appointment may have been removed by another request
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
            return res.status(200).json({ success: true, appointment: forCustomer(appointment) });
        }

        // Can't cancel an appointment that already happened
        if (appointment.status === 'COMPLETED' || isPastDate(appointment.date)) {
            return sendValidationError(res, 'This appointment has already happened.', null);
        }

        // Mark it as cancelled instead of deleting it,
        // so it still shows in the Past tab on the customer portal
        // DT-837: tagged Cancelled by patient for the admin history, and the
        // slot is freed for someone else.
        const updated = await prisma.appointment.update({
            where: { id: appointment.id },
            data: { status: 'CANCELLED', historyTag: 'CANCELLED_BY_PATIENT', activeSlot: null },
        });
                
        // Tell the person it was cancelled. Never throws.
        await notifyAppointmentChange(appointment, updated);
        // Send back the updated appointment so the portal can show the new status
        return res.status(200).json({ success: true, appointment: forCustomer(updated) });
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
            return res.status(200).json({ success: true, appointment: forCustomer(appointment) });
        }

        // DT-278 (722): Make sure the new slot isn't taken.
        // Leaves out this appointment itself and cancelled ones.
        const clash = await prisma.appointment.findFirst({
            where: {
                id: { not: appointment.id },
                activeSlot: slotKey(date, timeSlot),
            },
        });
        if(clash){
            return sendValidationError(res,'That time is already booked. Please choose another time slot.', 'timeSlot');
        }

        // Save the new date and time. Status goes back to PENDING
        // so staff/admin can confirm the new time.
        // DT-837: the appointment now holds the new slot.
        const updated=await prisma.appointment.update({
            where: { id: appointment.id },
            data: { date, timeSlot, status: 'PENDING', activeSlot: slotKey(date, timeSlot) },
        });
        // Tell the person the new date and time. Never throws.
        await notifyAppointmentChange(appointment, updated);
        // Send back the updated appointment so the portal can show the new date and time
        return res.status(200).json({ success: true, appointment: forCustomer(updated) });
    } catch (err) {
        // Unique rule on activeSlot - someone took the slot between the
        // check above and the update.
        if (err.code === 'P2002') {
            return sendValidationError(res, 'That time is already booked. Please choose another slot.', 'timeSlot');
        }
        return next(err);
    }   
}

// DT-837 / DT-927: PATCH /api/appointments/:id/history-tag
// Body: { tag: 'NO_SHOW' }. Changes only the tag of an appointment in
// history. No email is sent: the tag is for staff only.
async function updateHistoryTag(req, res, next) {
    try {
        const tag = String(req.body?.tag || '').toUpperCase();
        if (!HISTORY_TAGS.includes(tag)) {
            return sendValidationError(res, 'Please choose a valid tag.', 'tag');
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id: req.params.id },
        });
        if (!appointment || appointment.archivedAt) {
            return res.status(404).json({
                success: false,
                error: { message: 'Appointment not found.', field: null },
            });
        }
        if (!isInHistory(appointment)) {
            return sendValidationError(
                res,
                'Only appointments in history can be tagged.',
                'tag'
            );
        }

        const updated = await prisma.appointment.update({
            where: { id: appointment.id },
            data: { historyTag: tag },
        });
        return res.status(200).json({
            success: true,
            appointment: { ...updated, section: 'history' },
        });
    } catch (err) {
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
    // DT-837: appointment history
    updateHistoryTag,
    settlePastAppointments,
    isInHistory,
    hasStarted,
    officeNow,
    slotStartMinutes,
    HISTORY_TAGS,
    TIME_SLOTS,
    SERVICE_TYPES,
};
