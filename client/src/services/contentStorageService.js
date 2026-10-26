// DT-622 Sprint 8
// Preston Ball
// Service handling translation overrides with in-memory caching and database persistence

import { API_BASE_URL } from './api'

// DT-622 Sprint 8 - Preston Ball: Storage key for persisting in-memory translation overrides to localStorage
const STORAGE_KEY = 'cms_in_memory_translations'

// DT-622 Sprint 8 - Preston Ball: Store interface handling local in-memory caching and persistent browser storage for translations
export const InMemoryTranslationStore = {
  // DT-622 Sprint 8 - Preston Ball: Immediately invoked function initializing store data from localStorage or defaulting to an empty map
  data: (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      // DT-622 Sprint 8 - Preston Ball: Fallback in case of parse errors or unavailable storage
      return {}
    }
  })(),

  // DT-622 Sprint 8 - Preston Ball: Look up a translation string by its key path
  get (path) {
    return this.data[path]
  },

  // DT-622 Sprint 8 - Preston Ball: Return a shallow copy of the entire translations key-value mapping
  getAll () {
    return { ...this.data }
  },

  // DT-622 Sprint 8 - Preston Ball: Update a specific key path with a new value and sync the updated cache to localStorage
  update (path, value) {
    this.data[path] = value
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (err) {
      // DT-622 Sprint 8 - Preston Ball: Log storage persistence errors while preserving in-memory state
      console.error('Failed to persist in-memory store to localStorage:', err)
    }
    return this.data[path]
  },

  // DT-622 Sprint 8 - Preston Ball: Clear all cached translations from both memory and localStorage
  clear () {
    this.data = {}
    localStorage.removeItem(STORAGE_KEY)
  },

  // DT-622 Sprint 8 - Preston Ball: Load translations from database into in-memory store
  async loadFromDatabase () {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/content/text-entries`)
      if (!res.ok) return this.data
      const entries = await res.json()
      if (Array.isArray(entries)) {
        for (const entry of entries) {
          if (entry.id && entry.englishText) {
            this.data[entry.id] = entry.englishText
          }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
      }
    } catch (err) {
      console.error('Failed to load translations from database:', err)
    }
    return this.data
  }
}

// DT-622 Sprint 8 - Preston Ball: Handles saving English copy overrides, formatting key paths and persisting to database
export async function saveEnglishText (keyPath, englishText, authorId = 'Admin User') {
  // DT-622 Sprint 8 - Preston Ball: Standardize array-based key paths into a dot-delimited string
  const pathKey = Array.isArray(keyPath) ? keyPath.join('.') : keyPath

  // DT-622 Sprint 8 - Preston Ball: Send the changed text to local memory
  InMemoryTranslationStore.update(pathKey, englishText)

  // DT-622 Sprint 8 - Preston Ball: Persist translation override to the backend database
  try {
    const response = await fetch(`${API_BASE_URL}/admin/content/translations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keyPath: pathKey,
        locale: 'en',
        content: englishText,
        updatedBy: authorId,
        updatedAt: new Date().toISOString()
      })
    })
    if (!response.ok) {
      console.warn('Database translation update returned non-ok status:', response.status)
    }
  } catch (err) {
    console.error('Database translation transaction error:', err)
  }

  // DT-622 Sprint 8 - Preston Ball: Return a standardized operation receipt with timestamp and change metadata
  return {
    success: true,
    path: pathKey,
    value: englishText,
    author: authorId,
    timestamp: new Date().toISOString()
  }
}
