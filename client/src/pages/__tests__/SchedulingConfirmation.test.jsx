// DT-574: confirmation and details screens for the scheduling flow.
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn();
let mockLocationState = null;

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ state: mockLocationState }),
    };
});

import ClientSchedulingConfirmation from '../ClientSchedulingConfirmation';
import ViewAppointmentDetailsPage from '../ViewAppointmentDetailsPage';

const APPOINTMENT = {
    fullName: 'Jane Doe',
    phone: '916-555-0100',
    email: 'jane@example.com',
    serviceType: 'Home Health',
    date: '2027-06-15',
    timeSlot: '10:00 AM',
    notes: 'Front gate code 1234',
};

function renderWith(Component) {
    return render(
        <MemoryRouter>
            <Component />
        </MemoryRouter>
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockLocationState = null;
});

describe('E. Confirmation screen', () => {
    it('E1: renders the booked appointment', () => {
        mockLocationState = { appointment: APPOINTMENT };
        renderWith(ClientSchedulingConfirmation);

        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.getByText('Home Health')).toBeInTheDocument();
        expect(screen.getByText('10:00 AM')).toBeInTheDocument();
    });

    it('E2: shows the not-found state with nothing to display', () => {
        renderWith(ClientSchedulingConfirmation);
        expect(screen.getByText('confirmation.notFoundTitle')).toBeInTheDocument();
    });

    it('E2b: falls back to sessionStorage when router state is empty', () => {
        sessionStorage.setItem('newAppointment', JSON.stringify(APPOINTMENT));
        renderWith(ClientSchedulingConfirmation);
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
});

describe('E. Details screen', () => {
    it('E3: shows the not-found state with nothing to display', () => {
        renderWith(ViewAppointmentDetailsPage);
        expect(screen.getByText('details.notFoundTitle')).toBeInTheDocument();
    });

    it('E4: reads the appointment from sessionStorage', () => {
        sessionStorage.setItem('newAppointment', JSON.stringify(APPOINTMENT));
        renderWith(ViewAppointmentDetailsPage);
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('E5: survives corrupt sessionStorage', () => {
        sessionStorage.setItem('newAppointment', '{not valid json');
        expect(() => renderWith(ViewAppointmentDetailsPage)).not.toThrow();
        expect(screen.getByText('details.notFoundTitle')).toBeInTheDocument();
    });
});
