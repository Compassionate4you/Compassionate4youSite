// DT-622 Sprint 8
// Preston Ball
// Service handling user-created pages and hierarchy mapping with database persistence and fallback cache

import { SectionStorageService } from './sectionStorageService'
import { CardStorageService } from './cardStorageService'
import { API_BASE_URL } from './api'

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

  listeners: [],

  subscribe (listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  },

  _notify () {
    this.listeners.forEach(fn => fn(this.getPages()))
  },

  // DT-622 Sprint 8 - Preston Ball: Load pages from backend database
  async loadFromDatabase () {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/content/pages`)
      if (res.ok) {
        const remotePages = await res.json()
        if (Array.isArray(remotePages) && remotePages.length > 0) {
          this.data = remotePages
          this._persist()
          this._notify()
        }
      }
    } catch (err) {
      console.error('Failed to load user pages from database:', err)
    }
    return [...this.data]
  },

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
    this._notify()

    // DT-622 Sprint 8 - Preston Ball: Persist new page to the database
    async function dbCreatePage (pageData) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/content/pages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pageData)
        })
        if (!res.ok) throw new Error('Database page creation failed')
        return await res.json()
      } catch (err) {
        console.error('Database page creation error:', err)
      }
    }
    dbCreatePage(newPage)

    return newPage
  },

  updatePage (id, pageUpdates) {
    const index = this.data.findIndex(p => p.id === id)
    if (index === -1) throw new Error(`Page with ID "${id}" not found`)

    const updated = {
      ...this.data[index],
      ...pageUpdates,
      id: pageUpdates.id ? String(pageUpdates.id).trim() : this.data[index].id,
      content: {
        ...this.data[index].content,
        ...(pageUpdates.content || {})
      }
    }

    this.data[index] = updated
    this._persist()
    this._notify()

    // DT-622 Sprint 8 - Preston Ball: Persist page updates to the database
    async function dbUpdatePage (pageId, updates) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/content/pages/${pageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })
        if (!res.ok) throw new Error('Database page update failed')
        return await res.json()
      } catch (err) {
        console.error('Database page update error:', err)
      }
    }
    dbUpdatePage(id, updated)

    return updated
  },

  deletePage (id) {
    const index = this.data.findIndex(p => p.id === id)
    if (index === -1) throw new Error(`Page with ID "${id}" not found`)

    const removed = this.data.splice(index, 1)[0]
    this._persist()
    this._notify()

    // DT-622 Sprint 8 - Preston Ball: Delete page from database
    async function dbDeletePage (pageId) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/content/pages/${pageId}`, {
          method: 'DELETE'
        })
        if (!res.ok) throw new Error('Database page deletion failed')
        return await res.json()
      } catch (err) {
        console.error('Database page deletion error:', err)
      }
    }
    dbDeletePage(id)

    return removed
  },

  // DT-625 Sprint 8 - Preston Ball: Reorder pages
  reorderPages (newOrderedPages) {
    if (!Array.isArray(newOrderedPages)) return
    this.data = newOrderedPages.map((page, index) => ({
      ...page,
      content: {
        ...(page.content || {}),
        order: index
      }
    }))
    this._persist()
    this._notify()

    async function dbReorder (orderedIds) {
      try {
        await fetch(`${API_BASE_URL}/admin/content/pages/reorder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderedPageIds: orderedIds })
        })
      } catch (err) {
        console.error('Database page reorder error:', err)
      }
    }
    dbReorder(this.data.map(p => p.id))
  },

  // DT-625 Sprint 8 - Preston Ball: Rename page ID
  renamePage (oldId, newId) {
    const trimmedOldId = String(oldId || '').trim()
    const trimmedNewId = String(newId || '').trim()
    if (!trimmedOldId || !trimmedNewId) throw new Error('Both old and new page IDs are required')
    if (trimmedOldId === trimmedNewId) return this.getPageById(trimmedOldId)

    if (this.data.some(p => p.id === trimmedNewId)) {
      throw new Error(`Page ID "${trimmedNewId}" already exists`)
    }

    const index = this.data.findIndex(p => p.id === trimmedOldId)
    if (index === -1) throw new Error(`Page with ID "${trimmedOldId}" not found`)

    const updated = {
      ...this.data[index],
      id: trimmedNewId
    }
    this.data[index] = updated
    this._persist()
    this._notify()

    async function dbRename (oldKey, newKey) {
      try {
        await fetch(`${API_BASE_URL}/admin/content/pages/rename`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldId: oldKey, newId: newKey })
        })
      } catch (err) {
        console.error('Database page rename error:', err)
      }
    }
    dbRename(trimmedOldId, trimmedNewId)

    return updated
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
