// DT-622 Sprint 8
// Preston Ball
// Service handling color configurations with database persistence and fallback cache

import { API_BASE_URL } from './api'

const STORAGE_KEY = 'cms_color_config_store'

const INITIAL_COLORS = [
  { id: 'color-charcoal', lightModeColor: '#262626', darkModeColor: '#ffffff' },
  { id: 'color-sage', lightModeColor: '#9DA191', darkModeColor: '#1e293b' },
  { id: 'color-light-green', lightModeColor: '#DBE4C3', darkModeColor: '#2d3748' },
  { id: 'color-navy', lightModeColor: '#0f3460', darkModeColor: '#60a5fa' },
  { id: 'color-slate', lightModeColor: '#595959', darkModeColor: '#f1f5f9' }
]

// DT-510 Sprint 7 - PBall: Utility to calculate relative luminance of a hex color (0 to 1)
export function getLuminance (hex) {
  if (!hex || typeof hex !== 'string') return 0
  const cleanHex = hex.replace('#', '').trim()
  if (cleanHex.length !== 3 && cleanHex.length !== 6) return 0
  let r, g, b
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16) / 255
    g = parseInt(cleanHex[1] + cleanHex[1], 16) / 255
    b = parseInt(cleanHex[2] + cleanHex[2], 16) / 255
  } else {
    r = parseInt(cleanHex.substring(0, 2), 16) / 255
    g = parseInt(cleanHex.substring(2, 4), 16) / 255
    b = parseInt(cleanHex.substring(4, 6), 16) / 255
  }
  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

export const ColorConfigService = {
  data: (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : INITIAL_COLORS
    } catch {
      return INITIAL_COLORS
    }
  })(),

  getColors () {
    return [...this.data]
  },

  // DT-622 Sprint 8 - Preston Ball: Load colors from backend database
  async loadFromDatabase () {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/content/colors`)
      if (res.ok) {
        const remoteColors = await res.json()
        if (Array.isArray(remoteColors) && remoteColors.length > 0) {
          this.data = remoteColors
          this._persist()
        }
      }
    } catch (err) {
      console.error('Failed to load colors from database:', err)
    }
    return [...this.data]
  },

  getColorById (id) {
    return this.data.find(c => c.id === id) || null
  },

  createColor ({ id, lightModeColor, darkModeColor }) {
    const trimmedId = String(id || '').trim()
    if (!trimmedId) {
      throw new Error('Color ID cannot be empty')
    }
    if (this.data.some(c => c.id === trimmedId)) {
      throw new Error(`Color ID "${trimmedId}" already exists`)
    }

    const newColor = {
      id: trimmedId,
      lightModeColor: lightModeColor || '#000000',
      darkModeColor: darkModeColor || '#ffffff'
    }

    this.data.push(newColor)
    this._persist()

    // DT-622 Sprint 8 - Preston Ball: Persist color to database
    async function dbCreateColor (color) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/content/colors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(color)
        })
        if (!res.ok) throw new Error('Database color creation failed')
        return await res.json()
      } catch (err) {
        console.error('Database color creation error:', err)
      }
    }
    dbCreateColor(newColor)

    return newColor
  },

  updateColor (id, { lightModeColor, darkModeColor }) {
    const index = this.data.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error(`Color with ID "${id}" not found`)
    }

    const updated = {
      ...this.data[index],
      lightModeColor: lightModeColor ?? this.data[index].lightModeColor,
      darkModeColor: darkModeColor ?? this.data[index].darkModeColor
    }

    this.data[index] = updated
    this._persist()

    // DT-622 Sprint 8 - Preston Ball: Update color in database
    async function dbUpdateColor (colorId, updates) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/content/colors/${colorId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })
        if (!res.ok) throw new Error('Database color update failed')
        return await res.json()
      } catch (err) {
        console.error('Database color update error:', err)
      }
    }
    dbUpdateColor(id, updated)

    return updated
  },

  deleteColor (id) {
    const index = this.data.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error(`Color with ID "${id}" not found`)
    }

    const removed = this.data.splice(index, 1)[0]
    this._persist()

    // DT-622 Sprint 8 - Preston Ball: Delete color from database
    async function dbDeleteColor (colorId) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/content/colors/${colorId}`, {
          method: 'DELETE'
        })
        if (!res.ok) throw new Error('Database color deletion failed')
        return await res.json()
      } catch (err) {
        console.error('Database color deletion error:', err)
      }
    }
    dbDeleteColor(id)

    return removed
  },

  _persist () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (err) {
      console.error('Failed to persist colors to localStorage:', err)
    }
  }
}
