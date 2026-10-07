// DT-512 Sprint 7
// PBall
// Service handling user-created sections with in-memory persistence and database integration placeholders

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
      colors: section.colors || { backgroundColor: 'color-charcoal', headerColor: 'color-light-green', textColor: 'color-slate', accentColor: 'color-navy' },
      content: {
        header: section.content?.header || '',
        text: section.content?.text || '',
        imageUrl: section.content?.imageUrl || '',
        gridCols: Number(section.content?.gridCols || 3),
        cardIds: section.content?.cardIds || [],
        faqItems: section.content?.faqItems || [],
        mapAddress: section.content?.mapAddress || '1501 N Broadway, Ste 350A/B, Walnut Creek, CA 94596'
      }
    }

    this.data.push(newSection)
    this._persist()

    /*
     * DATABASE INTEGRATION (COMMENTED OUT UNTIL SITE RESTRUCTURING IS COMPLETED)
     * async function dbCreateSection (sectionData) {
     *   const res = await fetch('/api/admin/content/sections', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(sectionData)
     *   })
     *   if (!res.ok) throw new Error('Database section creation failed')
     *   return await res.json()
     * }
     * await dbCreateSection(newSection)
     */

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

    /*
     * DATABASE INTEGRATION (COMMENTED OUT UNTIL SITE RESTRUCTURING IS COMPLETED)
     * async function dbUpdateSection (sectionId, updates) {
     *   const res = await fetch(`/api/admin/content/sections/${sectionId}`, {
     *     method: 'PUT',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(updates)
     *   })
     *   if (!res.ok) throw new Error('Database section update failed')
     *   return await res.json()
     * }
     * await dbUpdateSection(id, updated)
     */

    return updated
  },

  deleteSection (id) {
    const index = this.data.findIndex(s => s.id === id)
    if (index === -1) throw new Error(`Section with ID "${id}" not found`)

    const removed = this.data.splice(index, 1)[0]
    this._persist()

    /*
     * DATABASE INTEGRATION (COMMENTED OUT UNTIL SITE RESTRUCTURING IS COMPLETED)
     * async function dbDeleteSection (sectionId) {
     *   const res = await fetch(`/api/admin/content/sections/${sectionId}`, {
     *     method: 'DELETE'
     *   })
     *   if (!res.ok) throw new Error('Database section deletion failed')
     *   return await res.json()
     * }
     * await dbDeleteSection(id)
     */

    return removed
  },

  _persist () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (err) {
      console.error('Failed to persist user sections to localStorage:', err)
    }
  }
}
