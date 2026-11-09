// Appointment status-change emails.
// DT - 820
// The service reads SendGrid credentials when it is first loaded, so each test
// sets them up, mocks SendGrid, and loads a fresh copy of the module.

const BASE = {
    id: 'appt-1',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: null,
    serviceType: 'Home Health',
    date: '2026-11-18',
    timeSlot: '10:00 AM',
    status: 'PENDING',
};

function loadService({ configured = true } = {}) {
    jest.resetModules();

    if (configured) {
        process.env.SENDGRID_API_KEY = 'SG.test-key';
        process.env.SENDGRID_FROM_EMAIL = 'noreply@example.com';
    } else {
        delete process.env.SENDGRID_API_KEY;
        delete process.env.SENDGRID_FROM_EMAIL;
    }
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_FROM_NUMBER;

    const send = jest.fn().mockResolvedValue([{}]);
    jest.doMock('@sendgrid/mail', () => ({ setApiKey: jest.fn(), send }));

    return { service: require('../notificationService'), send };
}

afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.SENDGRID_API_KEY;
    delete process.env.SENDGRID_FROM_EMAIL;
});

describe('getChangeEvent', () => {
    const { getChangeEvent } = loadService({ configured: false }).service;

    test('a new pending appointment is a request awaiting approval', () => {
        expect(getChangeEvent(null, { ...BASE, status: 'PENDING' })).toBe('requested');
    });

    test('a new confirmed appointment is a confirmation', () => {
        expect(getChangeEvent(null, { ...BASE, status: 'CONFIRMED' })).toBe('confirmed');
    });

    test('approving a pending appointment is a confirmation', () => {
        expect(getChangeEvent(BASE, { ...BASE, status: 'CONFIRMED' })).toBe('confirmed');
    });

    test('changing the date or time is a reschedule', () => {
        expect(getChangeEvent(BASE, { ...BASE, date: '2026-11-20' })).toBe('rescheduled');
        expect(getChangeEvent(BASE, { ...BASE, timeSlot: '2:00 PM' })).toBe('rescheduled');
    });

    test('a customer reschedule that returns to pending is still a reschedule', () => {
        const confirmed = { ...BASE, status: 'CONFIRMED' };
        const moved = { ...BASE, status: 'PENDING', date: '2026-11-25' };
        expect(getChangeEvent(confirmed, moved)).toBe('rescheduled');
    });

    test('cancelling is a cancellation, but only the first time', () => {
        const cancelled = { ...BASE, status: 'CANCELLED' };
        expect(getChangeEvent(BASE, cancelled)).toBe('cancelled');
        expect(getChangeEvent(cancelled, cancelled)).toBeNull();
    });

    test('edits that change nothing the person cares about send nothing', () => {
        expect(getChangeEvent(BASE, { ...BASE, fullName: 'Jane Q Doe' })).toBeNull();
        expect(getChangeEvent(BASE, { ...BASE, status: 'COMPLETED' })).toBeNull();
        expect(getChangeEvent(null, { ...BASE, status: 'CANCELLED' })).toBeNull();
    });
});

describe('buildAppointmentEmail', () => {
    const { buildAppointmentEmail } = loadService({ configured: false }).service;

    test.each(['requested', 'confirmed', 'rescheduled', 'cancelled'])(
        '%s email includes the date, time and status',
        (event) => {
            const status = event === 'cancelled' ? 'CANCELLED' : 'CONFIRMED';
            const { subject, body } = buildAppointmentEmail(event, { ...BASE, status }, BASE);

            expect(subject).toBeTruthy();
            expect(body).toContain('Jane Doe');
            expect(body).toContain('November 18, 2026');
            expect(body).toContain('10:00 AM');
            expect(body).toContain('Status:');
            expect(body).toContain('Home Health');
        }
    );

    test('requested email says the request is awaiting approval', () => {
        const { body } = buildAppointmentEmail('requested', BASE);
        expect(body).toContain('awaiting approval');
        expect(body).toContain('Pending approval');
    });

    test('confirmed email says the appointment is confirmed', () => {
        const { subject, body } = buildAppointmentEmail('confirmed', { ...BASE, status: 'CONFIRMED' });
        expect(subject).toMatch(/confirmed/i);
        expect(body).toContain('Confirmed');
    });

    test('rescheduled email shows the new and the previous date and time', () => {
        const moved = { ...BASE, date: '2026-12-02', timeSlot: '3:00 PM', status: 'PENDING' };
        const { body } = buildAppointmentEmail('rescheduled', moved, BASE);

        expect(body).toContain('December 2, 2026');
        expect(body).toContain('3:00 PM');
        expect(body).toContain('Previous date and time: Wednesday, November 18, 2026 at 10:00 AM');
        expect(body).toContain('awaiting approval');
    });

    test('cancelled email says it was cancelled and how to rebook', () => {
        const { subject, body } = buildAppointmentEmail('cancelled', { ...BASE, status: 'CANCELLED' });
        expect(subject).toMatch(/cancelled/i);
        expect(body).toContain('Cancelled');
        expect(body).toMatch(/book a new appointment/i);
    });

    test('an unknown event throws', () => {
        expect(() => buildAppointmentEmail('nope', BASE)).toThrow();
    });
});

describe('notifyAppointmentChange', () => {
    test('emails the address on the appointment when a request is made', async () => {
        const { service, send } = loadService();
        await service.notifyAppointmentChange(null, BASE);

        expect(send).toHaveBeenCalledTimes(1);
        expect(send.mock.calls[0][0]).toMatchObject({
            to: 'jane@example.com',
            from: 'noreply@example.com',
            subject: 'Your appointment request',
        });
    });

    test('emails a confirmation when an admin approves it', async () => {
        const { service, send } = loadService();
        await service.notifyAppointmentChange(BASE, { ...BASE, status: 'CONFIRMED' });

        expect(send).toHaveBeenCalledTimes(1);
        expect(send.mock.calls[0][0].subject).toBe('Your appointment is confirmed');
    });

    test('emails the new date and time when rescheduled', async () => {
        const { service, send } = loadService();
        await service.notifyAppointmentChange(BASE, {
            ...BASE,
            date: '2026-12-02',
            timeSlot: '3:00 PM',
        });

        expect(send).toHaveBeenCalledTimes(1);
        const payload = send.mock.calls[0][0];
        expect(payload.subject).toBe('Your appointment has been rescheduled');
        expect(payload.text).toContain('December 2, 2026');
        expect(payload.text).toContain('3:00 PM');
    });

    test('emails when cancelled', async () => {
        const { service, send } = loadService();
        await service.notifyAppointmentChange(BASE, { ...BASE, status: 'CANCELLED' });

        expect(send).toHaveBeenCalledTimes(1);
        expect(send.mock.calls[0][0].subject).toBe('Your appointment has been cancelled');
    });

    test('sends nothing when there is nothing to tell the person', async () => {
        const { service, send } = loadService();
        await service.notifyAppointmentChange(BASE, { ...BASE, notes: 'staff note' });
        expect(send).not.toHaveBeenCalled();
    });

    test('a delivery failure is logged and does not throw', async () => {
        const { service, send } = loadService();
        send.mockRejectedValue(new Error('SendGrid is down'));
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(
            service.notifyAppointmentChange(BASE, { ...BASE, status: 'CANCELLED' })
        ).resolves.toBeDefined();

        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('[email failed]'));
        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('SendGrid is down'));
    });

    test('a bad appointment is logged and does not throw', async () => {
        const { service, send } = loadService();
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(service.notifyAppointmentChange(null, { ...BASE, email: null }))
            .resolves.toBeNull();

        expect(send).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalled();
    });

    test('without SendGrid credentials it logs a skip and still resolves', async () => {
        const { service, send } = loadService({ configured: false });
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        const result = await service.notifyAppointmentChange(null, BASE);

        expect(send).not.toHaveBeenCalled();
        expect(result).toMatchObject({ skipped: true });
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[email skipped'));
    });
});

describe('sendAppointmentConfirmation', () => {
    test('still sends the request email for a new booking', async () => {
        const { service, send } = loadService();
        const results = await service.sendAppointmentConfirmation(BASE);

        expect(send).toHaveBeenCalledTimes(1);
        expect(send.mock.calls[0][0].subject).toBe('Your appointment request');
        expect(results).toHaveLength(1);
    });
});