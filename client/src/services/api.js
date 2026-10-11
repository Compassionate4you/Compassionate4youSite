// API client. Reads VITE_API_URL (server root, e.g. http://localhost:5000)
// and appends '/api'. Falls back to relative '/api' if unset.

const API_ROOT =
    (import.meta.env && import.meta.env.VITE_API_URL) || '';
const API_BASE_URL = API_ROOT
    ? `${API_ROOT.replace(/\/$/, '')}/api`
    : '/api';

// Thrown for non-2xx responses so callers can read the server's field/message.
export class ApiError extends Error {
    constructor(message, { status, field } = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.field = field ?? null;
    }
}

async function request(path, { method = 'GET', body } = {}) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        // Sends the session cookie with every call (DT-560).
        credentials: 'include',
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    let data = null;
    try {
        data = await res.json();
    } catch {
        // Some responses have no body.
    }

    if (!res.ok) {
        throw new ApiError(
            data?.error?.message || `Request failed (${res.status} ${res.statusText})`,
            { status: res.status, field: data?.error?.field }
        );
    }

    return data;
}

// DT-332: send a user message to the chatbot backend.
export async function sendChatMessage(message) {
    const data = await request('/chatbot/message', {
        method: 'POST',
        body: { message },
    });
    return data.reply;
}

// DT-556 / DT-560: auth.
export function apiSignup(email, password) {
    return request('/auth/signup', { method: 'POST', body: { email, password } });
}

export function apiLogin(email, password) {
    return request('/auth/login', { method: 'POST', body: { email, password } });
}

export function apiLogout() {
    return request('/auth/logout', { method: 'POST' });
}

export function apiMe() {
    return request('/auth/me');
}

// DT-563 / DT-564: appointments.
export function apiGetAvailability(date) {
    return request(`/appointments/availability?date=${encodeURIComponent(date)}`);
}

export function apiCreateAppointment(appointment) {
    return request('/appointments', { method: 'POST', body: appointment });
}

export function apiGetMyAppointments() {
    return request('/appointments/mine');
}

export default {
    sendChatMessage,
    apiSignup,
    apiLogin,
    apiLogout,
    apiMe,
    apiGetAvailability,
    apiCreateAppointment,
    apiGetMyAppointments,
};
