// DT-511 Sprint 7
// PBall
// Service handling text entries and unique ID validation with in-memory persistence and database integration placeholders

const STORAGE_KEY = 'cms_text_entries_store'

const INITIAL_TEXT_ENTRIES = [
  { id: 'landing.heroTitle', translationJsonPath: 'landing.heroTitle', englishText: 'Compassionate Care for Your Loved Ones' },
  { id: 'landing.heroSubtitle', translationJsonPath: 'landing.heroSubtitle', englishText: 'Professional home health and hospice services dedicated to providing quality care with dignity and respect.' },
  { id: 'landing.philosophyTitle', translationJsonPath: 'landing.philosophyTitle', englishText: 'Our Philosophy' },
  { id: 'landing.philosophyText', translationJsonPath: 'landing.philosophyText', englishText: 'We believe in treating our patients with dignity, respect, and empathy.' }
]

export const TextEntryService = {
  data: (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : INITIAL_TEXT_ENTRIES
    } catch {
      return INITIAL_TEXT_ENTRIES
    }
  })(),

  getTextEntries () {
    return [...this.data]
  },

  getTextEntryById (id) {
    return this.data.find(e => e.id === id) || null
  },

  isTextEntryIdUnique (id, excludeId = null) {
    const trimmed = String(id || '').trim()
    if (!trimmed) return false
    return !this.data.some(e => e.id === trimmed && e.id !== excludeId)
  },

  saveTextEntry ({ oldId, newId, translationJsonPath, englishText }) {
    const trimmedNewId = String(newId || '').trim()
    if (!trimmedNewId) throw new Error('Text entry ID cannot be empty')

    if (!this.isTextEntryIdUnique(trimmedNewId, oldId)) {
      throw new Error(`Text entry ID "${trimmedNewId}" must be unique. Another entry already uses this ID.`)
    }

    const index = oldId ? this.data.findIndex(e => e.id === oldId) : -1

    if (index !== -1) {
      this.data[index] = {
        id: trimmedNewId,
        translationJsonPath: translationJsonPath || trimmedNewId,
        englishText: englishText ?? this.data[index].englishText
      }
    } else {
      this.data.push({
        id: trimmedNewId,
        translationJsonPath: translationJsonPath || trimmedNewId,
        englishText: englishText || ''
      })
    }

    this._persist()

    /*
     * DATABASE INTEGRATION (COMMENTED OUT UNTIL SITE RESTRUCTURING IS COMPLETED)
     * async function dbSaveTextEntry (entryData) {
     *   const res = await fetch('/api/admin/content/text-entries', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(entryData)
     *   })
     *   if (!res.ok) throw new Error('Database text entry save failed')
     *   return await res.json()
     * }
     * await dbSaveTextEntry({ id: trimmedNewId, translationJsonPath, englishText })
     */

    return { success: true, id: trimmedNewId, englishText }
  },

  _persist () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (err) {
      console.error('Failed to persist text entries to localStorage:', err)
    }
  }
}
