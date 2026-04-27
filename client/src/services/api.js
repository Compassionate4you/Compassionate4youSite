// API client. Reads VITE_API_URL (server root, e.g. http://localhost:5000)
// and appends '/api'. Falls back to relative '/api' if unset.

const API_ROOT =
    (import.meta.env && import.meta.env.VITE_API_URL) || '';
const API_BASE_URL = API_ROOT
    ? `${API_ROOT.replace(/\/$/, '')}/api`
    : '/api';

async function request(path, { method = 'GET', body } = {}) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        let detail = '';
        try {
            const errBody = await res.json();
            detail = errBody?.error || JSON.stringify(errBody);
        } catch {
            // ignore parse failure
        }
        throw new Error(
            `Request failed (${res.status} ${res.statusText})${detail ? `: ${detail}` : ''}`
        );
    }

    return res.json();
}

// DT-332: send a user message to the chatbot backend.
export async function sendChatMessage(message) {
    const data = await request('/chatbot/message', {
        method: 'POST',
        body: { message },
    });
    return data.reply;
}

export default { sendChatMessage };
