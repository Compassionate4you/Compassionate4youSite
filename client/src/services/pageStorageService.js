// DT-514 Sprint 7
// PBall
// Service handling user-created pages and hierarchy mapping with in-memory persistence and database integration placeholders

import { SectionStorageService } from './sectionStorageService'
import { CardStorageService } from './cardStorageService'

const STORAGE_KEY = 'cms_user_pages_store'

const INITIAL_PAGES = [
  {
    id: 'landing',
    content: {
      title: 'Landing & Company Information',
      sectionIds: ['sec-hero', 'sec-cards']
    }
  },
  {
    id: 'homeHealth',
    content: {
      title: 'Home Health Services',
      sectionIds: []
    }
  },
  {
    id: 'hospice',
    content: {
      title: 'Hospice Care',
      sectionIds: []
    }
  }
]

export const PageStorageService = {
  data: (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : INITIAL_PAGES
    } catch {
      return INITIAL_PAGES
    }
  })(),

  getPages () {
    return [...this.data]
  },

  getPageById (id) {
    return this.data.find(p => p.id === id) || null
  },

  createPage (page) {
    const trimmedId = String(page?.id || '').trim()
    if (!trimmedId) throw new Error('Page ID cannot be empty')
    if (this.data.some(p => p.id === trimmedId)) {
      throw new Error(`Page ID "${trimmedId}" already exists`)
    }

    const newPage = {
      id: trimmedId,
      content: {
        title: page.content?.title || trimmedId,
        sectionIds: page.content?.sectionIds || []
      }
    }

    this.data.push(newPage)
    this._persist()

    /*
     * DATABASE INTEGRATION (COMMENTED OUT UNTIL SITE RESTRUCTURING IS COMPLETED)
     * async function dbCreatePage (pageData) {
     *   const res = await fetch('/api/admin/content/pages', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(pageData)
     *   })
     *   if (!res.ok) throw new Error('Database page creation failed')
     *   return await res.json()
     * }
     * await dbCreatePage(newPage)
     */

    return newPage
  },

  getAllocatedSectionIds () {
    const allocated = new Set()
    for (const page of this.data) {
      if (page.content?.sectionIds) {
        for (const secId of page.content.sectionIds) {
          allocated.add(secId)
        }
      }
    }
    return allocated
  },

  getUnallocatedSections () {
    const allocated = this.getAllocatedSectionIds()
    const allSections = SectionStorageService.getSections()
    return allSections.filter(sec => !allocated.has(sec.id))
  },

  getAllocatedCardIds () {
    const allocated = new Set()
    const allSections = SectionStorageService.getSections()
    for (const sec of allSections) {
      if (sec.content?.cardIds) {
        for (const cardId of sec.content.cardIds) {
          allocated.add(cardId)
        }
      }
    }
    return allocated
  },

  getUnallocatedCards () {
    const allocated = this.getAllocatedCardIds()
    const allCards = CardStorageService.getCards()
    return allCards.filter(card => !allocated.has(card.id))
  },

  _persist () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (err) {
      console.error('Failed to persist user pages to localStorage:', err)
    }
  }
}
