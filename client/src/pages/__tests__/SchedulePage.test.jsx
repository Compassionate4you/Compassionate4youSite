// DT-573 / DT-574: scheduling page component tests.
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../services/api', () => ({
    apiCreateAppointment: vi.fn(),
    apiGetAvailability: vi.fn(),
}));

import SchedulePage from '../SchedulePage';
import { apiCreateAppointment, apiGetAvailability } from '../../services/api';

const ALL_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'];

function renderPage() {
    return render(
        <MemoryRouter>
            <SchedulePage />
        </MemoryRouter>
    );
}

// A date well in the future so the form is never fighting "today".
const FUTURE_DATE = '2027-06-15';

async function fillValidForm(user, overrides = {}) {
    const values = {
        fullName: 'Jane Doe',
        phone: '916-555-0100',
        email: 'jane@example.com',
        serviceType: 'Home Health',
        date: FUTURE_DATE,
        timeSlot: '10:00 AM',
        notes: '',
        ...overrides,
    };

    if (values.fullName) await user.type(screen.getByLabelText('schedule.fullName'), values.fullName);
    if (values.phone) await user.type(screen.getByLabelText('schedule.phone'), values.phone);
    if (values.email) await user.type(screen.getByLabelText('schedule.email'), values.email);
    if (values.serviceType) {
        await user.selectOptions(screen.getByLabelText('schedule.serviceType'), values.serviceType);
    }
    if (values.date) {
        const dateInput = screen.getByLabelText('schedule.preferredDate');
        await user.clear(dateInput);
        await user.type(dateInput, values.date);
    }
    if (values.timeSlot) {
        // Availability loads after the date changes; wait for it to settle.
        await waitFor(() =>
            expect(screen.getByLabelText('schedule.time')).not.toBeDisabled()
        );
        await user.selectOptions(screen.getByLabelText('schedule.time'), values.timeSlot);
    }
    if (values.notes) await user.type(screen.getByLabelText('schedule.notes'), values.notes);

    return values;
}

function submit(user) {
    return user.click(screen.getByRole('button', { name: /schedule\.confirm|schedule\.submitting/ }));
}

beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    apiGetAvailability.mockResolvedValue({
        date: FUTURE_DATE,
        slots: ALL_SLOTS.map((s) => ({ timeSlot: s, available: true })),
    });
    apiCreateAppointment.mockResolvedValue({
        success: true,
        appointment: { id: 'appt-1', fullName: 'Jane Doe' },
    });
});

// ---------------------------------------------------------------- A: rendering

describe('A. Rendering', () => {
    it('A1: renders every field needed to book', () => {
        renderPage();
        expect(screen.getByLabelText('schedule.fullName')).toBeInTheDocument();
        expect(screen.getByLabelText('schedule.phone')).toBeInTheDocument();
        expect(screen.getByLabelText('schedule.email')).toBeInTheDocument();
        expect(screen.getByLabelText('schedule.serviceType')).toBeInTheDocument();
        expect(screen.getByLabelText('schedule.preferredDate')).toBeInTheDocument();
        expect(screen.getByLabelText('schedule.time')).toBeInTheDocument();
        expect(screen.getByLabelText('schedule.notes')).toBeInTheDocument();
    });

    it('A2: offers six time slots plus a placeholder', () => {
        renderPage();
        const options = screen.getByLabelText('schedule.time').querySelectorAll('option');
        expect(options).toHaveLength(ALL_SLOTS.length + 1);
    });

    it('A3: submit button starts enabled', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'schedule.confirm' })).toBeEnabled();
    });
});

// -------------------------------------------------------------- B: happy path

describe('B. Happy path (DT-573)', () => {
    it('B1/B2: sends the filled form to the API once, in the expected shape', async () => {
        const user = userEvent.setup();
        renderPage();
        await fillValidForm(user);
        await submit(user);

        await waitFor(() => expect(apiCreateAppointment).toHaveBeenCalledTimes(1));
        expect(apiCreateAppointment).toHaveBeenCalledWith(
            expect.objectContaining({
                fullName: 'Jane Doe',
                phone: '916-555-0100',
                email: 'jane@example.com',
                serviceType: 'Home Health',
                date: FUTURE_DATE,
                timeSlot: '10:00 AM',
            })
        );
    });

    it('B3: navigates to the confirmation page on success', async () => {
        const user = userEvent.setup();
        renderPage();
        await fillValidForm(user);
        await submit(user);

        await waitFor(() =>
            expect(mockNavigate).toHaveBeenCalledWith(
                '/schedule/confirmation',
                expect.objectContaining({ state: expect.any(Object) })
            )
        );
    });

    it('B4: stores the appointment in sessionStorage', async () => {
        const user = userEvent.setup();
        renderPage();
        await fillValidForm(user);
        await submit(user);

        await waitFor(() =>
            expect(sessionStorage.getItem('newAppointment')).not.toBeNull()
        );
    });

    it('B5: trims whitespace before sending', async () => {
        const user = userEvent.setup();
        renderPage();
        await fillValidForm(user, { fullName: '  Jane Doe  ', email: '  jane@example.com  ' });
        await submit(user);

        await waitFor(() => expect(apiCreateAppointment).toHaveBeenCalled());
        expect(apiCreateAppointment).toHaveBeenCalledWith(
            expect.objectContaining({ fullName: 'Jane Doe', email: 'jane@example.com' })
        );
    });

    it('B6: notes are optional', async () => {
        const user = userEvent.setup();
        renderPage();
        await fillValidForm(user, { notes: '' });
        await submit(user);

        await waitFor(() => expect(apiCreateAppointment).toHaveBeenCalledTimes(1));
    });
});

// -------------------------------------------------------------- C: validation

describe('C. Validation and bad input (DT-574)', () => {
    it('C1: empty form shows an error and sends nothing', async () => {
        const user = userEvent.setup();
        renderPage();
        await submit(user);

        expect(await screen.findByRole('alert')).toBeInTheDocument();
        expect(apiCreateAppointment).not.toHaveBeenCalled();
    });

    it.each([
        ['C2: name', { fullName: '' }],
        ['C3: phone', { phone: '' }],
        ['C4: email', { email: '' }],
        ['C5: service', { serviceType: '' }],
        ['C6: date', { date: '', timeSlot: '' }],
        ['C7: time', { timeSlot: '' }],
    ])('%s missing blocks submission', async (_label, overrides) => {
        const user = userEvent.setup();
        renderPage();
        await fillValidForm(user, overrides);
        await submit(user);

        expect(await screen.findByRole('alert')).toBeInTheDocument();
        expect(apiCreateAppointment).not.toHaveBeenCalled();
    });

    it('C8: whitespace-only name counts as missing', async () => {
        const user = userEvent.setup();
        renderPage();
        await fillValidForm(user, { fullName: '   ' });
        await submit(user);

        expect(await screen.findByRole('alert')).toBeInTheDocument();
        expect(apiCreateAppointment).not.toHaveBeenCalled();
    });

    it('C9: editing a field clears the error', async () => {
        const user = userEvent.setup();
        renderPage();
        await submit(user);
        expect(await screen.findByRole('alert')).toBeInTheDocument();

        await user.type(screen.getByLabelText('schedule.fullName'), 'J');
        await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    });
});

// ------------------------------------------------------------- D: edge cases

describe('D. Edge cases (DT-574)', () => {
    it('D1: shows the server message when the slot was just taken', async () => {
        apiCreateAppointment.mockRejectedValue(
            new Error('That time has just been booked. Please choose another slot.')
        );

        const user = userEvent.setup();
        renderPage();
        await fillValidForm(user);
        await submit(user);

        expect(await screen.findByRole('alert')).toHaveTextContent(/just been booked/i);
    });

    it('D2: surfaces a network failure without breaking the page', async () => {
        apiCreateAppointment.mockRejectedValue(new Error('Failed to fetch'));

        const user = userEvent.setup();
        renderPage();
        await fillValidForm(user);
        await submit(user);

        expect(await screen.findByRole('alert')).toBeInTheDocument();
        expect(screen.getByLabelText('schedule.fullName')).toBeInTheDocument();
    });

    it('D3: ignores a second click while the first is in flight', async () => {
        let resolveCreate;
        apiCreateAppointment.mockImplementation(
            () => new Promise((resolve) => { resolveCreate = resolve; })
        );

        const user = userEvent.setup();
        renderPage();
        await fillValidForm(user);

        const button = screen.getByRole('button', { name: /schedule\.confirm/ });
        await user.click(button);
        await user.click(button);

        expect(apiCreateAppointment).toHaveBeenCalledTimes(1);
        resolveCreate({ success: true, appointment: {} });
    });

    it('D4: changing the date clears a previously chosen time', async () => {
        const user = userEvent.setup();
        renderPage();
        await fillValidForm(user);
        expect(screen.getByLabelText('schedule.time')).toHaveValue('10:00 AM');

        const dateInput = screen.getByLabelText('schedule.preferredDate');
        await user.clear(dateInput);
        await user.type(dateInput, '2027-06-16');

        await waitFor(() => expect(screen.getByLabelText('schedule.time')).toHaveValue(''));
    });

    it('D5: disables slots the server reports as unavailable', async () => {
        apiGetAvailability.mockResolvedValue({
            date: FUTURE_DATE,
            slots: ALL_SLOTS.map((s) => ({ timeSlot: s, available: s !== '10:00 AM' })),
        });

        const user = userEvent.setup();
        renderPage();
        const dateInput = screen.getByLabelText('schedule.preferredDate');
        await user.type(dateInput, FUTURE_DATE);

        await waitFor(() => {
            const taken = screen
                .getByLabelText('schedule.time')
                .querySelector('option[value="10:00 AM"]');
            expect(taken).toBeDisabled();
        });
    });

    it('D6: stays usable when the availability lookup fails', async () => {
        apiGetAvailability.mockRejectedValue(new Error('offline'));

        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByLabelText('schedule.preferredDate'), FUTURE_DATE);

        await waitFor(() => {
            const options = screen
                .getByLabelText('schedule.time')
                .querySelectorAll('option:not([value=""])');
            options.forEach((o) => expect(o).not.toBeDisabled());
        });
    });

    it('D7: accepts a very long note', async () => {
        const longNote = 'a'.repeat(1000);
        const user = userEvent.setup();
        renderPage();
        await fillValidForm(user, { notes: longNote });
        await submit(user);

        await waitFor(() => expect(apiCreateAppointment).toHaveBeenCalled());
        expect(apiCreateAppointment).toHaveBeenCalledWith(
            expect.objectContaining({ notes: longNote })
        );
    });
});
