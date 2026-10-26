// DT-622 Sprint 8
// Preston Ball
// Service handling user-created sections with database persistence and fallback cache

import { API_BASE_URL } from './api'

const STORAGE_KEY = 'cms_user_sections_store'

const INITIAL_SECTIONS = [
  {
    id: 'sec-hero',
    layout: 'IMAGE_HEADER_TEXT',
    colors: { backgroundColor: 'color-charcoal', headerColor: 'color-light-green', textColor: 'color-slate', accentColor: 'color-navy' },
    content: {
      header: 'Compassionate Care for Your Loved Ones',
      text: 'Professional home health and hospice services dedicated to providing quality care with dignity and respect.',
      imageUrl: '/assets/images/older_couple_smiling.jpeg',
      gridCols: 3,
      cardIds: ['card-nurse'],
      faqItems: [],
      mapAddress: '1501 N Broadway, Ste 350A/B, Walnut Creek, CA 94596'
    }
  },
  {
    id: 'sec-cards',
    layout: 'CARD_GRID',
    colors: { backgroundColor: 'color-sage', headerColor: 'color-charcoal', textColor: 'color-charcoal', accentColor: 'color-light-green' },
    content: {
      header: 'Our Core Services',
      text: 'Explore our comprehensive range of specialized medical and personal support services.',
      imageUrl: '',
      gridCols: 2,
      cardIds: ['card-nurse', 'card-specialty'],
      faqItems: [],
      mapAddress: '1501 N Broadway, Ste 350A/B, Walnut Creek, CA 94596'
    }
  },
  {
    id: 'sec-faq-demo',
    layout: 'FAQ_SECTION',
    colors: { backgroundColor: 'color-light-green', headerColor: 'color-navy', textColor: 'color-charcoal', accentColor: 'color-navy' },
    content: {
      header: 'Frequently Asked Questions',
      text: 'Find answers to common questions about our home health and hospice care services.',
      imageUrl: '',
      gridCols: 3,
      cardIds: [],
      faqItems: [
        { q: 'What services do you offer?', a: 'We provide home health care and hospice care.' },
        { q: 'What areas do you serve?', a: 'We serve the Walnut Creek and greater Bay Area.' }
      ],
      mapAddress: '1501 N Broadway, Ste 350A/B, Walnut Creek, CA 94596'
    }
  }
]

export const SectionStorageService = {
  data: (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : INITIAL_SECTIONS
    } catch {
      return INITIAL_SECTIONS
    }
  })(),

  getSections () {
    return [...this.data]
  },

  // DT-622 Sprint 8 - Preston Ball: Load sections from backend database
  async loadFromDatabase () {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/content/sections`)
      if (res.ok) {
        const remoteSections = await res.json()
        if (Array.isArray(remoteSections) && remoteSections.length > 0) {
          this.data = remoteSections
          this._persist()
        }
      }
    } catch (err) {
      console.error('Failed to load user sections from database:', err)
    }
    return [...this.data]
  },

  getSectionById (id) {
    return this.data.find(s => s.id === id) || null
  },

  createSection (section) {
    const trimmedId = String(section?.id || '').trim()
    if (!trimmedId) throw new Error('Section ID cannot be empty')
    if (this.data.some(s => s.id === trimmedId)) {
      throw new Error(`Section ID "${trimmedId}" already exists`)
    }

    const newSection = {
      id: trimmedId,
      layout: section.layout || 'HEADER_TEXT',
      colors: section.colors || section.content?.colors || { backgroundColor: 'color-charcoal', headerColor: 'color-light-green', textColor: 'color-slate', accentColor: 'color-navy' },
      content: {
        ...(section.content || {}),
        header: section.content?.header || '',
        text: section.content?.text || '',
        imageUrl: section.content?.imageUrl || '',
        imagePosition: section.content?.imagePosition || 'left',
        gridCols: Number(section.content?.gridCols || 3),
        cardIds: section.content?.cardIds || [],
        faqItems: section.content?.faqItems || [],
        mapAddress: section.content?.mapAddress || '1501 N Broadway, Ste 350A/B, Walnut Creek, CA 94596'
      }
    }

    this.data.push(newSection)
    this._persist()

    // DT-622 Sprint 8 - Preston Ball: Persist section to the database
    async function dbCreateSection (sectionData) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/content/sections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sectionData)
        })
        if (!res.ok) throw new Error('Database section creation failed')
        return await res.json()
      } catch (err) {
        console.error('Database section creation error:', err)
      }
    }
    dbCreateSection(newSection)

    return newSection
  },

  updateSection (id, sectionUpdates) {
    const index = this.data.findIndex(s => s.id === id)
    if (index === -1) throw new Error(`Section with ID "${id}" not found`)

    const updated = {
      ...this.data[index],
      ...sectionUpdates,
      id: sectionUpdates.id ? String(sectionUpdates.id).trim() : this.data[index].id,
      colors: { ...this.data[index].colors, ...(sectionUpdates.colors || {}) },
      content: { ...this.data[index].content, ...(sectionUpdates.content || {}) }
    }

    this.data[index] = updated
    this._persist()

    // DT-622 Sprint 8 - Preston Ball: Update section in the database
    async function dbUpdateSection (sectionId, updates) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/content/sections/${sectionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })
        if (!res.ok) throw new Error('Database section update failed')
        return await res.json()
      } catch (err) {
        console.error('Database section update error:', err)
      }
    }
    dbUpdateSection(id, updated)

    return updated
  },

  deleteSection (id) {
    const index = this.data.findIndex(s => s.id === id)
    if (index === -1) throw new Error(`Section with ID "${id}" not found`)

    const removed = this.data.splice(index, 1)[0]
    this._persist()

    // DT-622 Sprint 8 - Preston Ball: Delete section from the database
    async function dbDeleteSection (sectionId) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/content/sections/${sectionId}`, {
          method: 'DELETE'
        })
        if (!res.ok) throw new Error('Database section deletion failed')
        return await res.json()
      } catch (err) {
        console.error('Database section deletion error:', err)
      }
    }
    dbDeleteSection(id)

    return removed
  },

  // DT-625 Sprint 8 - Preston Ball: Rename section ID and cascade references across pages
  async renameSection (oldId, newId) {
    const trimmedOldId = String(oldId || '').trim()
    const trimmedNewId = String(newId || '').trim()
    if (!trimmedOldId || !trimmedNewId) throw new Error('Both old and new section IDs are required')
    if (trimmedOldId === trimmedNewId) return this.getSectionById(trimmedOldId)

    if (this.data.some(s => s.id === trimmedNewId)) {
      throw new Error(`Section ID "${trimmedNewId}" already exists`)
    }

    const index = this.data.findIndex(s => s.id === trimmedOldId)
    if (index === -1) throw new Error(`Section with ID "${trimmedOldId}" not found`)

    const updated = {
      ...this.data[index],
      id: trimmedNewId
    }
    this.data[index] = updated
    this._persist()

    // Cascade to PageStorageService
    try {
      const { PageStorageService } = await import('./pageStorageService')
      const pages = PageStorageService.getPages()
      pages.forEach(p => {
        if (Array.isArray(p.content?.sectionIds) && p.content.sectionIds.includes(trimmedOldId)) {
          const updatedSectionIds = p.content.sectionIds.map(sid => sid === trimmedOldId ? trimmedNewId : sid)
          PageStorageService.updatePage(p.id, {
            content: { ...p.content, sectionIds: updatedSectionIds }
          })
        }
      })
    } catch (e) {
      console.warn('Could not cascade section rename to pages locally:', e)
    }

    // Persist to database
    try {
      await fetch(`${API_BASE_URL}/admin/content/sections/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldId: trimmedOldId, newId: trimmedNewId })
      })
    } catch (err) {
      console.error('Database section rename error:', err)
    }

    return updated
  },

  _persist () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (err) {
      console.error('Failed to persist user sections to localStorage:', err)
    }
  }
}
