// DT-513 Sprint 7
// PBall
// Service handling user-created cards with in-memory persistence and database integration placeholders

const STORAGE_KEY = 'cms_user_cards_store'

const INITIAL_CARDS = [
  {
    id: 'card-nurse',
    layout: 'HEADER_TEXT_BOX',
    colors: { backgroundColor: 'color-charcoal', headerColor: 'color-light-green', textColor: 'color-slate', accentColor: 'color-navy' },
    content: { header: 'Skilled Nursing Care', text: 'Professional registered nurses providing comprehensive in-home medical care.', imageUrl: '', facing: 'left', iconName: 'Heart' }
  },
  {
    id: 'card-specialty',
    layout: 'FULL_WIDTH_SPLIT',
    colors: { backgroundColor: 'color-sage', headerColor: 'color-charcoal', textColor: 'color-charcoal', accentColor: 'color-light-green' },
    content: { header: 'Specialized Recovery', text: 'Tailored recovery programs designed for post-operative comfort and rehabilitation.', imageUrl: '/assets/images/CareImage1.jpeg', facing: 'right', iconName: 'Activity' }
  },
  {
    id: 'card-badge',
    layout: 'HEADER_VECTOR_GRAPHIC',
    colors: { backgroundColor: 'color-light-green', headerColor: 'color-navy', textColor: 'color-charcoal', accentColor: 'color-navy' },
    content: { header: 'Trusted Experience', text: 'Serving our community with dedication and professional excellence since 2021.', imageUrl: '', facing: 'left', iconName: 'ShieldCheck' }
  }
]

export const CardStorageService = {
  data: (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : INITIAL_CARDS
    } catch {
      return INITIAL_CARDS
    }
  })(),

  getCards () {
    return [...this.data]
  },

  getCardById (id) {
    return this.data.find(c => c.id === id) || null
  },

  createCard (card) {
    const trimmedId = String(card?.id || '').trim()
    if (!trimmedId) {
      throw new Error('Card ID cannot be empty')
    }
    if (this.data.some(c => c.id === trimmedId)) {
      throw new Error(`Card ID "${trimmedId}" already exists`)
    }

    const newCard = {
      id: trimmedId,
      layout: card.layout || 'HEADER_TEXT_BOX',
      colors: card.colors || { backgroundColor: 'color-charcoal', headerColor: 'color-light-green', textColor: 'color-slate', accentColor: 'color-navy' },
      content: card.content || { header: '', text: '', imageUrl: '', facing: 'left', iconName: 'Heart' }
    }

    this.data.push(newCard)
    this._persist()

    /*
     * DATABASE INTEGRATION (COMMENTED OUT UNTIL SITE RESTRUCTURING IS COMPLETED)
     * async function dbCreateCard (cardData) {
     *   const res = await fetch('/api/admin/content/cards', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(cardData)
     *   })
     *   if (!res.ok) throw new Error('Database card creation failed')
     *   return await res.json()
     * }
     * await dbCreateCard(newCard)
     */

    return newCard
  },

  updateCard (id, cardUpdates) {
    const index = this.data.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error(`Card with ID "${id}" not found`)
    }

    const updated = {
      ...this.data[index],
      ...cardUpdates,
      id: cardUpdates.id ? String(cardUpdates.id).trim() : this.data[index].id,
      colors: { ...this.data[index].colors, ...(cardUpdates.colors || {}) },
      content: { ...this.data[index].content, ...(cardUpdates.content || {}) }
    }

    this.data[index] = updated
    this._persist()

    /*
     * DATABASE INTEGRATION (COMMENTED OUT UNTIL SITE RESTRUCTURING IS COMPLETED)
     * async function dbUpdateCard (cardId, updates) {
     *   const res = await fetch(`/api/admin/content/cards/${cardId}`, {
     *     method: 'PUT',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(updates)
     *   })
     *   if (!res.ok) throw new Error('Database card update failed')
     *   return await res.json()
     * }
     * await dbUpdateCard(id, updated)
     */

    return updated
  },

  deleteCard (id) {
    const index = this.data.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error(`Card with ID "${id}" not found`)
    }

    const removed = this.data.splice(index, 1)[0]
    this._persist()

    /*
     * DATABASE INTEGRATION (COMMENTED OUT UNTIL SITE RESTRUCTURING IS COMPLETED)
     * async function dbDeleteCard (cardId) {
     *   const res = await fetch(`/api/admin/content/cards/${cardId}`, {
     *     method: 'DELETE'
     *   })
     *   if (!res.ok) throw new Error('Database card deletion failed')
     *   return await res.json()
     * }
     * await dbDeleteCard(id)
     */

    return removed
  },

  _persist () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (err) {
      console.error('Failed to persist user cards to localStorage:', err)
    }
  }
}
