// DT-511 DT-625 Sprint 8
// Preston Ball
// Text configuration tool supporting Page -> Section -> Cards hierarchy, custom selects, custom typography formatting, and save confirmation modals

import React, { useState, useMemo, useEffect } from 'react'
import { PageStorageService } from '../../../services/pageStorageService'
import { SectionStorageService } from '../../../services/sectionStorageService'
import { CardStorageService } from '../../../services/cardStorageService'
import { AuditHistoryService } from '../../../services/auditHistoryService'
import CustomModal from './CustomModal'
import CustomSelect from './CustomSelect'
import TypographyControls from './TypographyControls'

export default function TextConfigTool ({ onNotification, setIsDirty, registerSaveHandler }) {
  const [pages, setPages] = useState(PageStorageService.getPages())
  const [selectedPageId, setSelectedPageId] = useState('')
  
  const selectedPage = PageStorageService.getPageById(selectedPageId)
  
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [selectedCardId, setSelectedCardId] = useState('')

  const [entryId, setEntryId] = useState('')
  const [englishText, setEnglishText] = useState('')
  const [typography, setTypography] = useState({ align: 'left', fontFamily: 'inherit', bold: false, italic: false })

  // Custom modal dialog state
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    confirmText: 'Confirm',
    onConfirm: null
  })

  const markDirty = () => {
    if (setIsDirty) setIsDirty(true)
  }

  const markClean = () => {
    if (setIsDirty) setIsDirty(false)
  }

  // Register save handler for unsaved changes prompt
  useEffect(() => {
    if (registerSaveHandler) {
      registerSaveHandler(() => executeSaveText())
    }
  }, [entryId, englishText, typography, selectedCardId, selectedSectionId])

  // Handle downstream resets
  useEffect(() => {
    setSelectedSectionId('')
    setSelectedCardId('')
    setEntryId('')
    setEnglishText('')
    setTypography({ align: 'left', fontFamily: 'inherit', bold: false, italic: false })
  }, [selectedPageId])

  useEffect(() => {
    setSelectedCardId('')
    setEntryId('')
    setEnglishText('')
    setTypography({ align: 'left', fontFamily: 'inherit', bold: false, italic: false })
  }, [selectedSectionId])

  useEffect(() => {
    setEntryId('')
    setEnglishText('')
    setTypography({ align: 'left', fontFamily: 'inherit', bold: false, italic: false })
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

  // Handle setting text and existing typography when ID changes
  const handleEntryIdChange = (val) => {
    setEntryId(val)
    if (!val) {
      setEnglishText('')
      setTypography({ align: 'left', fontFamily: 'inherit', bold: false, italic: false })
      return
    }
    
    // Look up text and typography
    if (selectedCardId && selectedCard) {
      const cTypo = selectedCard.content?.typography || {}
      if (val.endsWith('.header')) {
        setEnglishText(selectedCard.content?.header || '')
        setTypography(cTypo.header || { align: 'left', fontFamily: 'inherit', bold: false, italic: false })
      } else if (val.endsWith('.text')) {
        setEnglishText(selectedCard.content?.paragraph || selectedCard.content?.text || '')
        setTypography(cTypo.paragraph || cTypo.text || { align: 'left', fontFamily: 'inherit', bold: false, italic: false })
      }
    } else if (selectedSectionId && selectedSection) {
      const sTypo = selectedSection.content?.typography || {}
      if (val.endsWith('.header')) {
        setEnglishText(selectedSection.content?.header || '')
        setTypography(sTypo.header || { align: 'left', fontFamily: 'inherit', bold: false, italic: false })
      } else if (val.endsWith('.text')) {
        setEnglishText(selectedSection.content?.text || selectedSection.content?.paragraph || '')
        setTypography(sTypo.text || { align: 'left', fontFamily: 'inherit', bold: false, italic: false })
      } else if (val.includes('.faqItems.')) {
        const parts = val.split('.')
        const idx = parseInt(parts[3])
        const field = parts[4]
        setEnglishText(selectedSection.content?.faqItems?.[idx]?.[field] || '')
        setTypography({ align: 'left', fontFamily: 'inherit', bold: false, italic: false })
      }
    }
  }

  // DT-625 Sprint 8 - Preston Ball: Save confirmation before saving text
  const handleSaveText = (e) => {
    e.preventDefault()
    if (!entryId) return

    setModalState({
      isOpen: true,
      title: 'Confirm Save Text',
      message: `Are you sure you want to save text changes for "${entryId}"?`,
      type: 'confirm',
      confirmText: 'Save Text',
      onConfirm: () => {
        executeSaveText()
        setModalState((prev) => ({ ...prev, isOpen: false }))
      }
    })
  }

  const executeSaveText = () => {
    if (!entryId) return
    try {
      let before = ''
      if (selectedCardId) {
        const oldCard = CardStorageService.getCardById(selectedCardId)
        const oldContent = oldCard.content || {}
        const oldTypo = oldContent.typography || {}
        const newTypo = { ...oldTypo }

        if (entryId.endsWith('.header')) {
          before = oldContent.header
          newTypo.header = typography
          CardStorageService.updateCard(selectedCardId, {
            content: { ...oldContent, header: englishText, typography: newTypo }
          })
        }
        if (entryId.endsWith('.text')) {
          before = oldContent.paragraph || oldContent.text
          newTypo.paragraph = typography
          newTypo.text = typography
          CardStorageService.updateCard(selectedCardId, {
            content: { ...oldContent, paragraph: englishText, text: englishText, typography: newTypo }
          })
        }
        AuditHistoryService.recordAppliedChange({
          edits: { [`card.${selectedCardId}`]: { before: oldCard, after: CardStorageService.getCardById(selectedCardId) } }
        })
      } else if (selectedSectionId) {
        const oldSec = SectionStorageService.getSectionById(selectedSectionId)
        const oldContent = oldSec.content || {}
        const oldTypo = oldContent.typography || {}
        const newTypo = { ...oldTypo }

        if (entryId.endsWith('.header')) {
          before = oldContent.header
          newTypo.header = typography
          SectionStorageService.updateSection(selectedSectionId, {
            content: { ...oldContent, header: englishText, typography: newTypo }
          })
        } else if (entryId.endsWith('.text')) {
          before = oldContent.text
          newTypo.text = typography
          SectionStorageService.updateSection(selectedSectionId, {
            content: { ...oldContent, text: englishText, typography: newTypo }
          })
        } else if (entryId.includes('.faqItems.')) {
          const parts = entryId.split('.')
          const idx = parseInt(parts[3])
          const field = parts[4]
          const newFaqs = [...(oldContent.faqItems || [])]
          before = newFaqs[idx]?.[field]
          if (newFaqs[idx]) {
            newFaqs[idx][field] = englishText
          }
          SectionStorageService.updateSection(selectedSectionId, {
            content: { ...oldContent, faqItems: newFaqs }
          })
        }
        AuditHistoryService.recordAppliedChange({
          edits: { [`section.${selectedSectionId}`]: { before: oldSec, after: SectionStorageService.getSectionById(selectedSectionId) } }
        })
      }
      markClean()
      onNotification(`Saved text entry "${entryId}"`)
    } catch (err) {
      setModalState({
        isOpen: true,
        title: 'Error Saving Text',
        message: err.message,
        type: 'alert',
        confirmText: 'OK',
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false }))
      })
    }
  }

  const guidanceText = useMemo(() => {
    if (!selectedPageId) return 'Step 1: Select a page to unlock section editing.'
    if (selectedPageId === 'unallocated') {
      if (!selectedSectionId && !selectedCardId) return 'Editing Unallocated. Select a section OR a card below.'
      if (selectedSectionId && !selectedCardId) return 'Editing an unallocated section. Cards are greyed out unless it is a CARD_GRID.'
      if (selectedCardId && !selectedSectionId) return 'Editing an unallocated card. Sections are greyed out.'
    }
    if (!selectedSectionId) return 'Step 2: Select a section to edit its text.'
    if (selectedSection?.layout === 'CARD_GRID' && !selectedCardId) return 'Editing Section copy. Select a card below if you wish to edit individual card text.'
    if (selectedSectionId && !selectedCardId) return 'Editing Section copy. (Cards not available for this layout)'
    if (selectedCardId) return 'Editing Card copy.'
    return ''
  }, [selectedPageId, selectedSectionId, selectedCardId, selectedSection])

  const pageOptions = [
    { value: '', label: 'Select a Page...' },
    ...pages.map(p => ({ value: p.id, label: p.content?.title || p.id })),
    { value: 'unallocated', label: '[Unallocated Elements]' }
  ]

  const sectionOptions = [
    { value: '', label: 'Select a Section...' },
    ...availableSections.map(s => ({ value: s.id, label: `${s.id} (${s.layout})` }))
  ]

  const cardOptions = [
    { value: '', label: 'Select a Card...' },
    ...availableCards.map(c => ({ value: c.id, label: c.id }))
  ]

  const entryOptions = [
    { value: '', label: 'Select entry key...' },
    ...textIdOptions.map(opt => ({ value: opt, label: opt }))
  ]

  return (
    <div className="content-editor-card">
      <h2>Text Configuration Tool</h2>
      <p className="content-editor-card-description">Navigate Page &rarr; Section &rarr; Cards hierarchy and edit copy with custom typography.</p>
      
      <div style={{ padding: '12px', background: '#dbeafe', color: '#1e40af', borderRadius: '8px', marginTop: '16px', fontWeight: 'bold' }}>
        {guidanceText}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Page</label>
          <CustomSelect
            value={selectedPageId}
            onChange={(val) => setSelectedPageId(val)}
            options={pageOptions}
            ariaLabel="Select Page"
          />
        </div>
        <div style={{ opacity: isSectionDisabled ? 0.5 : 1 }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Section</label>
          <CustomSelect
            disabled={isSectionDisabled}
            value={selectedSectionId}
            onChange={(val) => setSelectedSectionId(val)}
            options={sectionOptions}
            ariaLabel="Select Section"
          />
        </div>
        <div style={{ opacity: isCardDisabled ? 0.5 : 1 }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Cards</label>
          <CustomSelect
            disabled={isCardDisabled}
            value={selectedCardId}
            onChange={(val) => setSelectedCardId(val)}
            options={cardOptions}
            ariaLabel="Select Card"
          />
        </div>
      </div>
      
      {(selectedSectionId || selectedCardId) && (
        <form onSubmit={handleSaveText} style={{ marginTop: '20px', background: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px' }}>
          <h3>Edit Text Entry</h3>
          <div style={{ marginTop: '10px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Text Entry ID</label>
            <CustomSelect
              value={entryId}
              onChange={(val) => handleEntryIdChange(val)}
              options={entryOptions}
              ariaLabel="Select Text Entry ID"
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>English Text</label>
            <textarea
              rows={3}
              value={englishText}
              onChange={(e) => {
                setEnglishText(e.target.value)
                markDirty()
              }}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          {/* DT-625 Sprint 8 - Preston Ball: Typography Controls for selected text entry */}
          <TypographyControls
            label="Text Formatting & Alignment"
            value={typography}
            onChange={(val) => {
              setTypography(val)
              markDirty()
            }}
          />

          <button
            type="submit"
            style={{ marginTop: '14px', padding: '10px 20px', background: '#0f172a', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Save Text Changes
          </button>
        </form>
      )}

      {/* DT-625 Sprint 8 - Preston Ball: Reusable custom modal dialog */}
      <CustomModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        onConfirm={modalState.onConfirm}
        onCancel={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
