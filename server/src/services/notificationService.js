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

async function sendEmail({ to, subject, body }) {
    if (!emailConfigured) {
        // eslint-disable-next-line no-console
        console.log(`[email skipped - no SendGrid credentials] to=${to} subject="${subject}"`);
        return { delivered: false, skipped: true, channel: 'email', to };
    }

    try {
        await sgMail.send({
            to,
            from: SENDGRID_FROM_EMAIL,
            subject,
            text: body,
        });
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

// Notifications never block a booking - a failed send is logged and the
// appointment still stands.
async function sendAppointmentConfirmation(appointment) {
    const summary = formatAppointment(appointment);
    const results = [];

    if (appointment.email) {
        results.push(
            await sendEmail({
                to: appointment.email,
                subject: 'Your appointment request',
                body:
                    `Hi ${appointment.fullName},\n\n` +
                    `We received your appointment request.\n\n${summary}\n\n` +
                    `Our staff will contact you shortly to confirm.\n\n` +
                    `Compassionate Home Health & Hospice`,
            })
        );
    }

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
};
