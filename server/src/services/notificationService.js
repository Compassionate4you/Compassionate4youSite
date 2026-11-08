// DT-565 / DT-566: appointment notifications.
//
// Email goes through SendGrid, SMS through Twilio. Both are skipped with a
// log line when their credentials are missing, so the app still runs for
// anyone who has not set them up.

const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');

const {
    SENDGRID_API_KEY,
    SENDGRID_FROM_EMAIL,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_FROM_NUMBER,
} = process.env;

const emailConfigured = Boolean(SENDGRID_API_KEY && SENDGRID_FROM_EMAIL);
const smsConfigured = Boolean(
    TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER
);

if (emailConfigured) {
    sgMail.setApiKey(SENDGRID_API_KEY);
}

const twilioClient = smsConfigured
    ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    : null;

function formatAppointment(appointment) {
    return [
        `Service: ${appointment.serviceType}`,
        `Date: ${appointment.date}`,
        `Time: ${appointment.timeSlot}`,
    ].join(' | ');
}

// Twilio needs E.164 (+15551234567). Accepts the 10-digit US numbers the
// scheduling form collects.
function toE164(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
    if (String(phone).trim().startsWith('+')) return String(phone).trim();
    return null;
}

async function sendEmail({ to, subject, body, html, replyTo }) {
    if (!emailConfigured) {
        // eslint-disable-next-line no-console
        console.log(`[email skipped - no SendGrid credentials] to=${to} subject="${subject}"`);
        return { delivered: false, skipped: true, channel: 'email', to };
    }

    try {
        const payload = {
            to,
            from: SENDGRID_FROM_EMAIL,
            subject,
            text: body,
        };
        // DT-629: HTML body when a template supplied one.
        if (html) payload.html = html;
        // Lets staff reply straight to the person who wrote in.
        if (replyTo) payload.replyTo = replyTo;

        await sgMail.send(payload);
        return { delivered: true, channel: 'email', to };
    } catch (err) {
        // SendGrid puts the useful detail in response.body.
        const detail = err?.response?.body
            ? JSON.stringify(err.response.body)
            : err.message;
        // eslint-disable-next-line no-console
        console.error(`[email failed] to=${to}: ${detail}`);
        return { delivered: false, channel: 'email', to, error: detail };
    }
}

async function sendSms({ to, body }) {
    if (!smsConfigured) {
        // eslint-disable-next-line no-console
        console.log(`[sms skipped - no Twilio credentials] to=${to}`);
        return { delivered: false, skipped: true, channel: 'sms', to };
    }

    const normalized = toE164(to);
    if (!normalized) {
        // eslint-disable-next-line no-console
        console.error(`[sms failed] "${to}" is not a usable phone number`);
        return { delivered: false, channel: 'sms', to, error: 'invalid phone number' };
    }

    try {
        await twilioClient.messages.create({
            to: normalized,
            from: TWILIO_FROM_NUMBER,
            body,
        });
        return { delivered: true, channel: 'sms', to: normalized };
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[sms failed] to=${normalized}: ${err.message}`);
        return { delivered: false, channel: 'sms', to: normalized, error: err.message };
    }
}


// Appointment status-change emails.
//
// One email per event: requested (awaiting approval), confirmed, rescheduled
// and cancelled. Each one carries the service, date, time, status and what the
// person should do next.
//DT-820

const OFFICE_PHONE = process.env.OFFICE_PHONE || '(925) 425-7104';

const APPOINTMENT_EVENTS = {
    REQUESTED: 'requested',
    CONFIRMED: 'confirmed',
    RESCHEDULED: 'rescheduled',
    CANCELLED: 'cancelled',
};

const STATUS_LABELS = {
    PENDING: 'Pending approval',
    CONFIRMED: 'Confirmed',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed',
};

function statusLabel(status) {
    return STATUS_LABELS[status] || String(status || 'Unknown');
}

// 2026-11-18 -> Wednesday, November 18, 2026. Falls back to the stored text.
function formatDate(date) {
    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return String(date);
    return parsed.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function detailLines(appointment) {
    return [
        `Service: ${appointment.serviceType}`,
        `Date: ${formatDate(appointment.date)}`,
        `Time: ${appointment.timeSlot}`,
        `Status: ${statusLabel(appointment.status)}`,
    ].join('\n');
}

// Builds { subject, body } for one event. `previous` is the appointment as it
// was before the change and is only used by the rescheduled email.
function buildAppointmentEmail(event, appointment, previous) {
    const greeting = `Hi ${appointment.fullName},`;
    const details = detailLines(appointment);
    const contact = `Questions or need to make a change? Call us at ${OFFICE_PHONE}.`;
    const signature = `Compassionate Home Health & Hospice\n${OFFICE_PHONE}`;

    switch (event) {
        case APPOINTMENT_EVENTS.REQUESTED:
            return {
                subject: 'Your appointment request',
                body: [
                    greeting,
                    'We received your appointment request. It is awaiting approval.',
                    details,
                    'What happens next: our staff will review your request and email you as soon as it is confirmed. You do not need to do anything else right now.',
                    contact,
                    signature,
                ].join('\n\n'),
            };

        case APPOINTMENT_EVENTS.CONFIRMED:
            return {
                subject: 'Your appointment is confirmed',
                body: [
                    greeting,
                    'Good news - your appointment is confirmed.',
                    details,
                    'Please be ready at the scheduled time. If you have an account, you can also view your appointment in the Customer Portal.',
                    contact,
                    signature,
                ].join('\n\n'),
            };

        case APPOINTMENT_EVENTS.RESCHEDULED: {
            const before = previous
                ? `Previous date and time: ${formatDate(previous.date)} at ${previous.timeSlot}`
                : null;
            const next = appointment.status === 'PENDING'
                ? 'The new time is awaiting approval. We will email you as soon as it is confirmed.'
                : 'Please be ready at the new time.';
            return {
                subject: 'Your appointment has been rescheduled',
                body: [
                    greeting,
                    'Your appointment has been rescheduled. Here are the updated details:',
                    details,
                    before,
                    next,
                    contact,
                    signature,
                ].filter(Boolean).join('\n\n'),
            };
        }

        case APPOINTMENT_EVENTS.CANCELLED:
            return {
                subject: 'Your appointment has been cancelled',
                body: [
                    greeting,
                    'Your appointment has been cancelled.',
                    details,
                    `If this was a mistake, or you would like to book a new appointment, visit our scheduling page or call us at ${OFFICE_PHONE}.`,
                    signature,
                ].join('\n\n'),
            };

        default:
            throw new Error(`Unknown appointment email event: ${event}`);
    }
}

// Decides which email, if any, a change should send. `previous` is null for a
// brand-new appointment.
function getChangeEvent(previous, current) {
    if (!current) return null;

    if (!previous) {
        if (current.status === 'CONFIRMED') return APPOINTMENT_EVENTS.CONFIRMED;
        if (current.status === 'PENDING') return APPOINTMENT_EVENTS.REQUESTED;
        return null;
    }

    const statusChanged = previous.status !== current.status;
    const timeChanged =
        previous.date !== current.date || previous.timeSlot !== current.timeSlot;

    if (current.status === 'CANCELLED') {
        return statusChanged ? APPOINTMENT_EVENTS.CANCELLED : null;
    }
    if (current.status === 'COMPLETED') return null;

    if (timeChanged) return APPOINTMENT_EVENTS.RESCHEDULED;
    if (statusChanged && current.status === 'CONFIRMED') {
        return APPOINTMENT_EVENTS.CONFIRMED;
    }
    return null;
}

// Sends one appointment email to the address on the appointment. Never throws:
// a failure is logged and the booking, cancel or reschedule still goes through.
async function sendAppointmentEmailNotification(event, appointment, previous) {
    try {
        if (!appointment?.email) {
            // eslint-disable-next-line no-console
            console.error(`[appointment email skipped] no email on appointment ${appointment?.id}`);
            return null;
        }
        const { subject, body } = buildAppointmentEmail(event, appointment, previous);
        return await sendEmail({ to: appointment.email, subject, body });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(
            `[appointment email failed] event=${event} appointment=${appointment?.id}: ${err.message}`
        );
        return null;
    }
}

// Call after any appointment is created or changed. Works out from the old and
// new records which email applies and sends it. Never throws.
async function notifyAppointmentChange(previous, current) {
    try {
        const event = getChangeEvent(previous, current);
        if (!event) return null;
        return await sendAppointmentEmailNotification(event, current, previous);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[appointment notification failed] ${err.message}`);
        return null;
    }
}

// Notifications never block a booking - a failed send is logged and the
// appointment still stands.
// Sent when a visitor or customer books: the "request received" email, plus a
// text message when a phone number was given.
async function sendAppointmentConfirmation(appointment) {
    const summary = formatAppointment(appointment);
    const results = [];

    const emailResult = await sendAppointmentEmailNotification(
        APPOINTMENT_EVENTS.REQUESTED,
        appointment
    );
    if (emailResult) results.push(emailResult);

    if (appointment.phone) {
        results.push(
            await sendSms({
                to: appointment.phone,
                body: `Compassionate4you: we received your appointment request. ${summary}. Our staff will contact you to confirm.`,
            })
        );
    }

    return results;
}

module.exports = {
    sendEmail,
    sendSms,
    sendAppointmentConfirmation,
    toE164,
    APPOINTMENT_EVENTS,
    buildAppointmentEmail,
    getChangeEvent,
    sendAppointmentEmailNotification,
    notifyAppointmentChange,
};