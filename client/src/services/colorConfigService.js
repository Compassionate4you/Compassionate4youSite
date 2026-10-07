// DT-510 Sprint 7
// PBall
// Service handling color configurations with in-memory persistence and database integration placeholders

const STORAGE_KEY = 'cms_color_config_store'

const INITIAL_COLORS = [
  { id: 'color-charcoal', lightModeColor: '#262626', darkModeColor: '#ffffff' },
  { id: 'color-sage', lightModeColor: '#9DA191', darkModeColor: '#1e293b' },
  { id: 'color-light-green', lightModeColor: '#DBE4C3', darkModeColor: '#2d3748' },
  { id: 'color-navy', lightModeColor: '#0f3460', darkModeColor: '#60a5fa' },
  { id: 'color-slate', lightModeColor: '#595959', darkModeColor: '#f1f5f9' }
]

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

    /*
     * DATABASE INTEGRATION (COMMENTED OUT UNTIL SITE RESTRUCTURING IS COMPLETED)
     * async function dbCreateColor (color) {
     *   const res = await fetch('/api/admin/content/colors', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(color)
     *   })
     *   if (!res.ok) throw new Error('Database color creation failed')
     *   return await res.json()
     * }
     * await dbCreateColor(newColor)
     */

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

    /*
     * DATABASE INTEGRATION (COMMENTED OUT UNTIL SITE RESTRUCTURING IS COMPLETED)
     * async function dbUpdateColor (colorId, updates) {
     *   const res = await fetch(`/api/admin/content/colors/${colorId}`, {
     *     method: 'PUT',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(updates)
     *   })
     *   if (!res.ok) throw new Error('Database color update failed')
     *   return await res.json()
     * }
     * await dbUpdateColor(id, updated)
     */

    return updated
  },

  deleteColor (id) {
    const index = this.data.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error(`Color with ID "${id}" not found`)
    }

    const removed = this.data.splice(index, 1)[0]
    this._persist()

    /*
     * DATABASE INTEGRATION (COMMENTED OUT UNTIL SITE RESTRUCTURING IS COMPLETED)
     * async function dbDeleteColor (colorId) {
     *   const res = await fetch(`/api/admin/content/colors/${colorId}`, {
     *     method: 'DELETE'
     *   })
     *   if (!res.ok) throw new Error('Database color deletion failed')
     *   return await res.json()
     * }
     * await dbDeleteColor(id)
     */

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
