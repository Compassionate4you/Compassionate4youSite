// DT-565 / DT-566: appointment notifications.
//
// Email and SMS providers are not connected yet, so these log the message
// that would be sent and report success. Swap the bodies for real provider
// calls when credentials are available - the call sites do not need to change.

function formatAppointment(appointment) {
    return [
        `Service: ${appointment.serviceType}`,
        `Date: ${appointment.date}`,
        `Time: ${appointment.timeSlot}`,
    ].join(' | ');
}

async function sendEmail({ to, subject, body }) {
    // eslint-disable-next-line no-console
    console.log(`[email] to=${to} subject="${subject}" body="${body}"`);
    return { delivered: true, channel: 'email', to };
}

async function sendSms({ to, body }) {
    // eslint-disable-next-line no-console
    console.log(`[sms] to=${to} body="${body}"`);
    return { delivered: true, channel: 'sms', to };
}

async function sendAppointmentConfirmation(appointment) {
    const summary = formatAppointment(appointment);
    const results = [];

    if (appointment.email) {
        results.push(
            await sendEmail({
                to: appointment.email,
                subject: 'Your appointment request',
                body: `Hi ${appointment.fullName}, we received your request. ${summary}`,
            })
        );
    }

    if (appointment.phone) {
        results.push(
            await sendSms({
                to: appointment.phone,
                body: `Compassionate4you: we received your appointment request. ${summary}`,
            })
        );
    }

    return results;
}

module.exports = {
    sendEmail,
    sendSms,
    sendAppointmentConfirmation,
};
