// DT-396: chat history persistence. Talks to /api/chatbot/history.
const API_ROOT = (import.meta.env && import.meta.env.VITE_API_URL) || ''
const API_BASE_URL = API_ROOT ? `${API_ROOT.replace(/\/$/, '')}/api` : '/api'

async function request (path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined
  })

  if (!res.ok) {
    throw new Error(`Request failed (${res.status} ${res.statusText})`)
  }

  return res.json()
}

export async function loadHistory (clientSessionId) {
  const data = await request(
        `/chatbot/history/${encodeURIComponent(clientSessionId)}`
  )
  return Array.isArray(data.messages) ? data.messages : []
}

// DT-906: also saves what the message is (translation key, FAQ id, buttons)
// so it can be shown in another language after a reload.
export async function saveMessage (clientSessionId, message) {
  const body = {
    clientSessionId,
    sender: message.sender,
    body: message.text || ''
  }
  if (message.textKey) body.textKey = message.textKey
  if (message.faqId) body.faqId = message.faqId
  if (Array.isArray(message.actionButtons) && message.actionButtons.length > 0) {
    body.actionButtons = message.actionButtons
  }
  return request('/chatbot/history', { method: 'POST', body })
}

export default { loadHistory, saveMessage }
