// DT-909 / DT-910 Sprint 9
// Gandhar Tare
// Reads the public list of office locations (GET /api/locations) for the
// landing page. Kept apart from services/api.js, like chatHistoryApi.js, so
// page tests that stub api.js still render the map.

const API_ROOT = (import.meta.env && import.meta.env.VITE_API_URL) || ''
const API_BASE_URL = API_ROOT ? `${API_ROOT.replace(/\/$/, '')}/api` : '/api'

export async function getPublicLocations () {
  const res = await fetch(`${API_BASE_URL}/locations`, { credentials: 'include' })
  if (!res.ok) {
    throw new Error(`Request failed (${res.status} ${res.statusText})`)
  }
  const data = await res.json()
  return Array.isArray(data?.locations) ? data.locations : []
}

export default { getPublicLocations }
