// DT-511 Sprint 7
// PBall
// Text configuration tool supporting Page -> Section -> Cards hierarchy and unique ID validation

import React, { useState, useMemo, useEffect } from 'react'
import { PageStorageService } from '../../../services/pageStorageService'
import { SectionStorageService } from '../../../services/sectionStorageService'
import { CardStorageService } from '../../../services/cardStorageService'
import { AuditHistoryService } from '../../../services/auditHistoryService'
import { TextEntryService } from '../../../services/textEntryService'

export default function TextConfigTool ({ onNotification }) {
  const pages = useMemo(() => PageStorageService.getPages(), [])
  const [selectedPageId, setSelectedPageId] = useState('')
  
  const selectedPage = PageStorageService.getPageById(selectedPageId)
  
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [selectedCardId, setSelectedCardId] = useState('')

  const [entryId, setEntryId] = useState('')
  const [englishText, setEnglishText] = useState('')

  // Handle downstream resets
  useEffect(() => {
    setSelectedSectionId('')
    setSelectedCardId('')
    setEntryId('')
    setEnglishText('')
  }, [selectedPageId])

  useEffect(() => {
    setSelectedCardId('')
    setEntryId('')
    setEnglishText('')
  }, [selectedSectionId])

  useEffect(() => {
    setEntryId('')
    setEnglishText('')
  }, [selectedCardId])

  const availableSections = useMemo(() => {
    if (selectedPageId === 'unallocated') return PageStorageService.getUnallocatedSections()
    if (!selectedPage || !selectedPage.content?.sectionIds) return []
    return selectedPage.content.sectionIds.map(id => SectionStorageService.getSectionById(id)).filter(Boolean)
  }, [selectedPageId, selectedPage])

  const selectedSection = SectionStorageService.getSectionById(selectedSectionId)

  const availableCards = useMemo(() => {
    if (selectedPageId === 'unallocated' && !selectedSectionId) return PageStorageService.getUnallocatedCards()
    if (!selectedSection || !selectedSection.content?.cardIds) return []
    return selectedSection.content.cardIds.map(id => CardStorageService.getCardById(id)).filter(Boolean)
  }, [selectedPageId, selectedSectionId, selectedSection])

  const selectedCard = CardStorageService.getCardById(selectedCardId)

  const isSectionDisabled = !selectedPageId || (selectedPageId === 'unallocated' && selectedCardId !== '')
  const isCardDisabled = !selectedPageId || (selectedPageId !== 'unallocated' && (!selectedSection || selectedSection.layout !== 'CARD_GRID')) || (selectedPageId === 'unallocated' && selectedSectionId !== '' && selectedSection?.layout !== 'CARD_GRID')

  // Computed options for Text ID
  const textIdOptions = useMemo(() => {
    let opts = []
    if (selectedCardId && selectedCard) {
      opts.push(`card.${selectedCardId}.header`)
      opts.push(`card.${selectedCardId}.text`)
    } else if (selectedSectionId && selectedSection) {
      opts.push(`section.${selectedSectionId}.header`)
      opts.push(`section.${selectedSectionId}.text`)
      if (selectedSection.layout === 'FAQ_SECTION') {
        const faqs = selectedSection.content?.faqItems || []
        faqs.forEach((f, i) => {
          opts.push(`section.${selectedSectionId}.faqItems.${i}.q`)
          opts.push(`section.${selectedSectionId}.faqItems.${i}.a`)
        })
      }
    }
    return opts
  }, [selectedSection, selectedCard, selectedSectionId, selectedCardId])

  // Handle setting text when ID changes
  const handleEntryIdChange = (val) => {
    setEntryId(val)
    if (!val) { setEnglishText(''); return }
    
    // Look up text
    if (selectedCardId && selectedCard) {
      if (val.endsWith('.header')) setEnglishText(selectedCard.content?.header || '')
      else if (val.endsWith('.text')) setEnglishText(selectedCard.content?.text || '')
    } else if (selectedSectionId && selectedSection) {
      if (val.endsWith('.header')) setEnglishText(selectedSection.content?.header || '')
      else if (val.endsWith('.text')) setEnglishText(selectedSection.content?.text || '')
      else if (val.includes('.faqItems.')) {
        const parts = val.split('.')
        const idx = parseInt(parts[3])
        const field = parts[4]
        setEnglishText(selectedSection.content?.faqItems?.[idx]?.[field] || '')
      }
    }
  }

  const handleSaveText = (e) => {
    e.preventDefault()
    if (!entryId) return
    try {
      let before = ''
      if (selectedCardId) {
        const oldCard = CardStorageService.getCardById(selectedCardId)
        if (entryId.endsWith('.header')) { before = oldCard.content.header; CardStorageService.updateCard(selectedCardId, { content: { ...oldCard.content, header: englishText } }) }
        if (entryId.endsWith('.text')) { before = oldCard.content.text; CardStorageService.updateCard(selectedCardId, { content: { ...oldCard.content, text: englishText } }) }
        AuditHistoryService.recordAppliedChange({ edits: { [`card.${selectedCardId}`]: { before: oldCard, after: CardStorageService.getCardById(selectedCardId) } } })
      } else if (selectedSectionId) {
        const oldSec = SectionStorageService.getSectionById(selectedSectionId)
        if (entryId.endsWith('.header')) { before = oldSec.content.header; SectionStorageService.updateSection(selectedSectionId, { content: { ...oldSec.content, header: englishText } }) }
        else if (entryId.endsWith('.text')) { before = oldSec.content.text; SectionStorageService.updateSection(selectedSectionId, { content: { ...oldSec.content, text: englishText } }) }
        else if (entryId.includes('.faqItems.')) {
          const parts = entryId.split('.')
          const idx = parseInt(parts[3])
          const field = parts[4]
          const newFaqs = [...oldSec.content.faqItems]
          before = newFaqs[idx][field]
          newFaqs[idx][field] = englishText
          SectionStorageService.updateSection(selectedSectionId, { content: { ...oldSec.content, faqItems: newFaqs } })
        }
        AuditHistoryService.recordAppliedChange({ edits: { [`section.${selectedSectionId}`]: { before: oldSec, after: SectionStorageService.getSectionById(selectedSectionId) } } })
      }
      onNotification(`Saved text entry "${entryId}"`)
    } catch (err) { alert(err.message) }
  }

  const guidanceText = useMemo(() => {
    if (!selectedPageId) return "Step 1: Select a page to unlock section editing."
    if (selectedPageId === 'unallocated') {
      if (!selectedSectionId && !selectedCardId) return "Editing Unallocated. Select a section OR a card below."
      if (selectedSectionId && !selectedCardId) return "Editing an unallocated section. Cards are greyed out unless it is a CARD_GRID."
      if (selectedCardId && !selectedSectionId) return "Editing an unallocated card. Sections are greyed out."
    }
    if (!selectedSectionId) return "Step 2: Select a section to edit its text."
    if (selectedSection?.layout === 'CARD_GRID' && !selectedCardId) return "Editing Section copy. Select a card below if you wish to edit individual card text."
    if (selectedSectionId && !selectedCardId) return "Editing Section copy. (Cards not available for this layout)"
    if (selectedCardId) return "Editing Card copy."
    return ""
  }, [selectedPageId, selectedSectionId, selectedCardId, selectedSection])

  return (
    <div className="content-editor-card">
      <h2>Text Configuration Tool</h2>
      <p className="content-editor-card-description">Navigate Page &rarr; Section &rarr; Cards hierarchy and edit copy.</p>
      
      <div style={{ padding: '12px', background: '#dbeafe', color: '#1e40af', borderRadius: '8px', marginTop: '16px', fontWeight: 'bold' }}>
        {guidanceText}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Page</label>
          <select value={selectedPageId} onChange={(e) => setSelectedPageId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
            <option value="">Select a Page...</option>
            {pages.map(p => <option key={p.id} value={p.id}>{p.content?.title || p.id}</option>)}
            <option value="unallocated">[Unallocated Elements]</option>
          </select>
        </div>
        <div style={{ opacity: isSectionDisabled ? 0.5 : 1 }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Section</label>
          <select disabled={isSectionDisabled} value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: isSectionDisabled ? '1px solid #ccc' : '2px solid #3b82f6', cursor: isSectionDisabled ? 'not-allowed' : 'pointer' }}>
            <option value="">Select a Section...</option>
            {availableSections.map(s => <option key={s.id} value={s.id}>{s.id} ({s.layout})</option>)}
          </select>
        </div>
        <div style={{ opacity: isCardDisabled ? 0.5 : 1 }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Cards</label>
          <select disabled={isCardDisabled} value={selectedCardId} onChange={(e) => setSelectedCardId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: isCardDisabled ? '1px solid #ccc' : '2px solid #3b82f6', cursor: isCardDisabled ? 'not-allowed' : 'pointer' }}>
            <option value="">Select a Card...</option>
            {availableCards.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
          </select>
        </div>
      </div>
      
      {(selectedSectionId || selectedCardId) && (
        <form onSubmit={handleSaveText} style={{ marginTop: '20px', background: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px' }}>
          <h3>Edit Text Entry</h3>
          <div style={{ marginTop: '10px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Text Entry ID</label>
            <select value={entryId} onChange={(e) => handleEntryIdChange(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="">Select entry key...</option>
              {textIdOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>English Text</label>
            <textarea rows={3} value={englishText} onChange={(e) => setEnglishText(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
          <button type="submit" style={{ marginTop: '12px', padding: '8px 16px', background: '#0f172a', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Save Text</button>
        </form>
      )}
    </div>
  )
}
