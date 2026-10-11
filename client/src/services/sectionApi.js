const API_ROOT =
  (import.meta.env && import.meta.env.VITE_API_URL) || ''
const API_BASE_URL = API_ROOT
  ? `${API_ROOT.replace(/\/$/, '')}/api`
  : '/api'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}/sections${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body?.error?.message || 'Something went wrong.');
    err.field = body?.error?.field;
    throw err;
  }
  return body;
}

export const fetchSection = (slug) => request(`/${slug}`);
export const fetchSectionForEdit = (slug) => request(`/${slug}/edit`);
export const fetchSectionList = () => request('');
export const saveSection = (slug, payload) =>
  request(`/${slug}`, { method: 'PUT', body: JSON.stringify(payload) });
