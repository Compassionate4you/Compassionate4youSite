// DT-622 Sprint 8
// Preston Ball
// Service handling user-created cards with database persistence and fallback cache

import { API_BASE_URL } from './api'

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

  // DT-622 Sprint 8 - Preston Ball: Load card elements from backend database
  async loadFromDatabase () {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/content/cards`)
      if (res.ok) {
        const remoteCards = await res.json()
        if (Array.isArray(remoteCards) && remoteCards.length > 0) {
          this.data = remoteCards
          this._persist()
        }
      }
    } catch (err) {
      console.error('Failed to load user cards from database:', err)
    }
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

    // DT-622 Sprint 8 - Preston Ball: Persist card to database
    async function dbCreateCard (cardData) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/content/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardData)
        })
        if (!res.ok) throw new Error('Database card creation failed')
        return await res.json()
      } catch (err) {
        console.error('Database card creation error:', err)
      }
    }
    dbCreateCard(newCard)

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

    // DT-622 Sprint 8 - Preston Ball: Update card in database
    async function dbUpdateCard (cardId, updates) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/content/cards/${cardId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })
        if (!res.ok) throw new Error('Database card update failed')
        return await res.json()
      } catch (err) {
        console.error('Database card update error:', err)
      }
    }
    dbUpdateCard(id, updated)

    return updated
  },

  deleteCard (id) {
    const index = this.data.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error(`Card with ID "${id}" not found`)
    }

    const removed = this.data.splice(index, 1)[0]
    this._persist()

    // DT-622 Sprint 8 - Preston Ball: Delete card from database
    async function dbDeleteCard (cardId) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/content/cards/${cardId}`, {
          method: 'DELETE'
        })
        if (!res.ok) throw new Error('Database card deletion failed')
        return await res.json()
      } catch (err) {
        console.error('Database card deletion error:', err)
      }
    }
    dbDeleteCard(id)

    return removed
  },

  // DT-625 Sprint 8 - Preston Ball: Rename card ID and cascade references across sections
  async renameCard (oldId, newId) {
    const trimmedOldId = String(oldId || '').trim()
    const trimmedNewId = String(newId || '').trim()
    if (!trimmedOldId || !trimmedNewId) throw new Error('Both old and new card IDs are required')
    if (trimmedOldId === trimmedNewId) return this.getCardById(trimmedOldId)

    if (this.data.some(c => c.id === trimmedNewId)) {
      throw new Error(`Card ID "${trimmedNewId}" already exists`)
    }

    const index = this.data.findIndex(c => c.id === trimmedOldId)
    if (index === -1) throw new Error(`Card with ID "${trimmedOldId}" not found`)

    const updated = {
      ...this.data[index],
      id: trimmedNewId
    }
    this.data[index] = updated
    this._persist()

    // Cascade to SectionStorageService
    try {
      const { SectionStorageService } = await import('./sectionStorageService')
      const sections = SectionStorageService.getSections()
      sections.forEach(s => {
        if (Array.isArray(s.content?.cardIds) && s.content.cardIds.includes(trimmedOldId)) {
          const updatedCardIds = s.content.cardIds.map(cid => cid === trimmedOldId ? trimmedNewId : cid)
          SectionStorageService.updateSection(s.id, {
            content: { ...s.content, cardIds: updatedCardIds }
          })
        }
      })
    } catch (e) {
      console.warn('Could not cascade card rename to sections locally:', e)
    }

    // Persist to database
    try {
      await fetch(`${API_BASE_URL}/admin/content/cards/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldId: trimmedOldId, newId: trimmedNewId })
      })
    } catch (err) {
      console.error('Database card rename error:', err)
    }

    return updated
  },

  _persist () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (err) {
      console.error('Failed to persist user cards to localStorage:', err)
    }
  }
}
