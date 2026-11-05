// DT-923 DT-622 DT-618 DT-625 Sprint 9
// PBall
// Card Element Manager component dispatching layout-specific form components with custom typography, element renaming, custom selects, custom modals, and live preview

import React, { useState, useEffect } from 'react'
import { CardStorageService } from '../../../services/cardStorageService'
import { SectionStorageService } from '../../../services/sectionStorageService'
import { ColorConfigService } from '../../../services/colorConfigService'
import { AuditHistoryService } from '../../../services/auditHistoryService'
import ModularCard from '../../modular/cards/ModularCard'
import CustomModal from './CustomModal'
import CustomSelect from './CustomSelect'
import HeaderParagraphLayout from './CardManager/HeaderParagraphLayout'
import ImageFullWidthLayout from './CardManager/ImageFullWidthLayout'
import HeaderSymbolLayout from './CardManager/HeaderSymbolLayout'

const SYMBOL_OPTIONS = [
  'Heart', 'Check', 'Home', 'Stethoscope', 'Users', 'Phone',
  'Pill', 'Activity', 'Star', 'Shield', 'ShieldCheck', 'Award', 'Smile'
]

const CARD_LAYOUT_OPTIONS = [
  { value: 'HEADER_PARAGRAPH', label: 'HEADER_PARAGRAPH (Title & bullet text)' },
  { value: 'IMAGE_FULL_WIDTH', label: 'IMAGE_FULL_WIDTH (Split image and content)' },
  { value: 'HEADER_SYMBOL', label: 'HEADER_SYMBOL (Icon badge & title)' }
]

const ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left Aligned' },
  { value: 'center', label: 'Centered' },
  { value: 'right', label: 'Right Aligned' }
]

export default function CardManager ({ onNotification, setIsDirty, registerSaveHandler }) {
  const [cards, setCards] = useState(CardStorageService.getCards())
  const colors = ColorConfigService.getColors()
  const sections = SectionStorageService.getSections()

  const [mode, setMode] = useState('create')
  const [activeTab, setActiveTab] = useState('content') // 'content' | 'colors'
  const [themeMode, setThemeMode] = useState('light')

  // Create Mode state
  const [cardId, setCardId] = useState('')
  const [layout, setLayout] = useState('HEADER_PARAGRAPH')
  const [header, setHeader] = useState('')
  const [paragraph, setParagraph] = useState('')
  const [headerTypography, setHeaderTypography] = useState({ align: 'left', fontFamily: 'inherit', bold: false, italic: false })
  const [paragraphTypography, setParagraphTypography] = useState({ align: 'left', fontFamily: 'inherit', bold: false, italic: false })
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [symbol, setSymbol] = useState('Heart')
  const [alignment, setAlignment] = useState('left')
  const [bgColor, setBgColor] = useState('')
  const [headerColor, setHeaderColor] = useState('')
  const [textColor, setTextColor] = useState('')

  // Manage Mode state
  const [locationFilter, setLocationFilter] = useState('all')
  const [manageCardId, setManageCardId] = useState('')
  const [editCardId, setEditCardId] = useState('')
  const [editLayout, setEditLayout] = useState('HEADER_PARAGRAPH')
  const [editHeader, setEditHeader] = useState('')
  const [editParagraph, setEditParagraph] = useState('')
  const [editHeaderTypography, setEditHeaderTypography] = useState({ align: 'left', fontFamily: 'inherit', bold: false, italic: false })
  const [editParagraphTypography, setEditParagraphTypography] = useState({ align: 'left', fontFamily: 'inherit', bold: false, italic: false })
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editImageAlt, setEditImageAlt] = useState('')
  const [editSymbol, setEditSymbol] = useState('Heart')
  const [editAlignment, setEditAlignment] = useState('left')
  const [editBgColor, setEditBgColor] = useState('')
  const [editHeaderColor, setEditHeaderColor] = useState('')
  const [editTextColor, setEditTextColor] = useState('')

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

  // Register save handler for unsaved changes leave interception
  useEffect(() => {
    if (registerSaveHandler) {
      registerSaveHandler(() => {
        if (mode === 'create') {
          return executeCreate()
        } else {
          return executeSaveManage()
        }
      })
    }
  }, [mode, cardId, layout, header, paragraph, headerTypography, paragraphTypography, imageUrl, imageAlt, symbol, alignment, bgColor, headerColor, textColor, manageCardId, editCardId, editLayout, editHeader, editParagraph, editHeaderTypography, editParagraphTypography, editImageUrl, editImageAlt, editSymbol, editAlignment, editBgColor, editHeaderColor, editTextColor])

  const handleSelectManage = (id) => {
    setManageCardId(id)
    setEditCardId(id)
    markClean()
    if (id) {
      const c = CardStorageService.getCardById(id)
      const data = c.content || {}
      const col = data.colors || c.colors || {}
      const typo = data.typography || {}
      setEditLayout(c.layout || c.layoutType || 'HEADER_PARAGRAPH')
      setEditHeader(data.header || '')
      setEditParagraph(data.paragraph || data.text || '')
      setEditHeaderTypography(typo.header || { align: 'left', fontFamily: 'inherit', bold: false, italic: false })
      setEditParagraphTypography(typo.paragraph || typo.text || { align: 'left', fontFamily: 'inherit', bold: false, italic: false })
      setEditImageUrl(data.imageUrl || '')
      setEditImageAlt(data.imageAlt || '')
      setEditSymbol(data.symbol || data.iconName || 'Heart')
      setEditAlignment(data.alignment || data.facing || 'left')
      setEditBgColor(col.backgroundColor || '')
      setEditHeaderColor(col.headerColor || '')
      setEditTextColor(col.textColor || '')
    }
  }

  // DT-625 Sprint 8 - Preston Ball: Save confirmation before creating card
  const handleCreate = (e) => {
    e.preventDefault()
    const trimmedId = cardId.trim()
    if (!trimmedId) {
      setModalState({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please enter a Card ID.',
        type: 'alert',
        confirmText: 'OK',
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false }))
      })
      return
    }

    setModalState({
      isOpen: true,
      title: 'Confirm Card Creation',
      message: `Are you sure you want to create card "${trimmedId}"?`,
      type: 'confirm',
      confirmText: 'Create Card',
      onConfirm: () => {
        executeCreate()
        setModalState((prev) => ({ ...prev, isOpen: false }))
      }
    })
  }

  const executeCreate = () => {
    const trimmedId = cardId.trim()
    if (!trimmedId) return
    try {
      const cardContent = {
        header,
        paragraph,
        typography: {
          header: headerTypography,
          paragraph: paragraphTypography
        },
        imageUrl,
        imageAlt,
        symbol,
        alignment,
        colors: {
          backgroundColor: bgColor,
          headerColor,
          textColor
        }
      }

      const created = CardStorageService.createCard({
        id: trimmedId,
        layout,
        content: cardContent
      })
      setCards(CardStorageService.getCards())
      AuditHistoryService.recordAppliedChange({
        additions: [{ type: 'card', id: created.id, data: created }]
      })
      setCardId('')
      setHeader('')
      setParagraph('')
      markClean()
      onNotification(`Created card "${created.id}"`)
    } catch (err) {
      setModalState({
        isOpen: true,
        title: 'Error Creating Card',
        message: err.message,
        type: 'alert',
        confirmText: 'OK',
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false }))
      })
    }
  }

  // DT-625 Sprint 8 - Preston Ball: Save confirmation before updating card
  const handleSaveManage = (e) => {
    e.preventDefault()
    if (!manageCardId) return

    setModalState({
      isOpen: true,
      title: 'Confirm Save Changes',
      message: `Are you sure you want to save changes to card "${manageCardId}"?`,
      type: 'confirm',
      confirmText: 'Save Card Changes',
      onConfirm: () => {
        executeSaveManage()
        setModalState((prev) => ({ ...prev, isOpen: false }))
      }
    })
  }

  const executeSaveManage = async () => {
    if (!manageCardId) return
    try {
      const oldCard = CardStorageService.getCardById(manageCardId)
      let activeId = manageCardId

      // DT-625 Sprint 8 - Preston Ball: Handle card ID rename if modified
      if (editCardId && editCardId !== manageCardId) {
        await CardStorageService.renameCard(manageCardId, editCardId)
        activeId = editCardId
      }

      const updatedContent = {
        ...oldCard.content,
        header: editHeader,
        paragraph: editParagraph,
        typography: {
          header: editHeaderTypography,
          paragraph: editParagraphTypography
        },
        imageUrl: editImageUrl,
        imageAlt: editImageAlt,
        symbol: editSymbol,
        alignment: editAlignment,
        colors: {
          backgroundColor: editBgColor,
          headerColor: editHeaderColor,
          textColor: editTextColor
        }
      }

      const updated = CardStorageService.updateCard(activeId, {
        layout: editLayout,
        content: updatedContent
      })
      setCards(CardStorageService.getCards())
      setManageCardId(activeId)
      AuditHistoryService.recordAppliedChange({
        edits: { [`card.${activeId}`]: { before: oldCard, after: updated } }
      })
      markClean()
      onNotification(`Updated card "${activeId}"`)
    } catch (err) {
      setModalState({
        isOpen: true,
        title: 'Error Updating Card',
        message: err.message,
        type: 'alert',
        confirmText: 'OK',
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false }))
      })
    }
  }

  const handleDelete = (id) => {
    setModalState({
      isOpen: true,
      title: 'Delete Card',
      message: `Are you sure you want to permanently delete card "${id}"? This action cannot be undone.`,
      type: 'delete',
      confirmText: 'Delete Card',
      onConfirm: () => {
        try {
          const removed = CardStorageService.deleteCard(id)
          setCards(CardStorageService.getCards())
          AuditHistoryService.recordAppliedChange({
            deletions: [{ type: 'card', id, data: removed }]
          })
          onNotification(`Deleted card "${id}"`)
          if (manageCardId === id) setManageCardId('')
          markClean()
        } catch (err) {
          setModalState({
            isOpen: true,
            title: 'Error Deleting Card',
            message: err.message,
            type: 'alert',
            confirmText: 'OK',
            onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false }))
          })
        }
        setModalState((prev) => ({ ...prev, isOpen: false }))
      }
    })
  }

  const filteredCards = cards.filter(c => {
    if (locationFilter === 'all') return true
    if (locationFilter === 'unallocated') {
      return !sections.some(s => s.content?.cardIds?.includes(c.id))
    }
    const sec = sections.find(s => s.id === locationFilter)
    return sec && sec.content?.cardIds?.includes(c.id)
  })

  // Live draft preview
  const activeLayout = mode === 'create' ? layout : editLayout
  const activeContent = mode === 'create' ? {
    header: header || 'Card Header Preview',
    paragraph: paragraph || 'Descriptive card paragraph or bullet points...',
    typography: { header: headerTypography, paragraph: paragraphTypography },
    imageUrl: imageUrl || '/assets/images/CareImage1.jpeg',
    imageAlt: imageAlt || 'Card image preview',
    symbol,
    alignment,
    colors: { backgroundColor: bgColor, headerColor, textColor }
  } : {
    header: editHeader || 'Card Header',
    paragraph: editParagraph || 'Card paragraph',
    typography: { header: editHeaderTypography, paragraph: editParagraphTypography },
    imageUrl: editImageUrl,
    imageAlt: editImageAlt,
    symbol: editSymbol,
    alignment: editAlignment,
    colors: { backgroundColor: editBgColor, headerColor: editHeaderColor, textColor: editTextColor }
  }

  const draftCard = {
    id: (mode === 'create' ? cardId : manageCardId) || 'draft-card',
    layout: activeLayout,
    content: activeContent
  }

  const colorOptions = [
    { value: '', label: 'Default Theme Color' },
    ...colors.map(c => ({ value: c.id, label: c.id, color: c.lightModeColor }))
  ]

  const locationFilterOptions = [
    { value: 'all', label: 'All Cards' },
    { value: 'unallocated', label: 'Unallocated Cards' },
    ...sections.map(s => ({ value: s.id, label: `Section: ${s.id}` }))
  ]

  const symbolDropdownOptions = SYMBOL_OPTIONS.map(s => ({ value: s, label: s }))

  // DT-923 Sprint 9 - PBall: Dispatch per-layout form component for CardManager
  const renderCardLayoutFields = ({
    currentLayout,
    currentHeader,
    onHeaderChange,
    currentHeaderTypography,
    onHeaderTypographyChange,
    currentParagraph,
    onParagraphChange,
    currentParagraphTypography,
    onParagraphTypographyChange,
    currentImageUrl,
    onImageUrlChange,
    currentImageAlt,
    onImageAltChange,
    currentSymbol,
    onSymbolChange,
    currentAlignment,
    onAlignmentChange,
    isEdit = false
  }) => {
    switch (currentLayout) {
      case 'IMAGE_FULL_WIDTH':
        return (
          <ImageFullWidthLayout
            header={currentHeader}
            onHeaderChange={onHeaderChange}
            headerTypography={currentHeaderTypography}
            onHeaderTypographyChange={onHeaderTypographyChange}
            paragraph={currentParagraph}
            onParagraphChange={onParagraphChange}
            paragraphTypography={currentParagraphTypography}
            onParagraphTypographyChange={onParagraphTypographyChange}
            imageUrl={currentImageUrl}
            onImageUrlChange={onImageUrlChange}
            imageAlt={currentImageAlt}
            onImageAltChange={onImageAltChange}
            alignment={currentAlignment}
            onAlignmentChange={onAlignmentChange}
            imageUrlPlaceholder={isEdit ? '/assets/images/CareImage1.jpeg' : '/images/older_couple_smiling.jpeg'}
          />
        )
      case 'HEADER_SYMBOL':
        return (
          <HeaderSymbolLayout
            header={currentHeader}
            onHeaderChange={onHeaderChange}
            headerTypography={currentHeaderTypography}
            onHeaderTypographyChange={onHeaderTypographyChange}
            symbol={currentSymbol}
            onSymbolChange={onSymbolChange}
            symbolOptions={symbolDropdownOptions}
            alignment={currentAlignment}
            onAlignmentChange={onAlignmentChange}
            alignmentOptions={ALIGNMENT_OPTIONS}
            symbolLabel={isEdit ? 'Icon Symbol' : 'Symbol Icon'}
            symbolAriaLabel={isEdit ? 'Icon Symbol' : 'Select Icon Symbol'}
            alignmentLabel={isEdit ? 'Icon Alignment' : 'Alignment'}
            alignmentAriaLabel={isEdit ? 'Icon Alignment' : 'Select Icon Alignment'}
          />
        )
      case 'HEADER_PARAGRAPH':
      default:
        return (
          <HeaderParagraphLayout
            header={currentHeader}
            onHeaderChange={onHeaderChange}
            headerTypography={currentHeaderTypography}
            onHeaderTypographyChange={onHeaderTypographyChange}
            paragraph={currentParagraph}
            onParagraphChange={onParagraphChange}
            paragraphTypography={currentParagraphTypography}
            onParagraphTypographyChange={onParagraphTypographyChange}
            alignment={currentAlignment}
            onAlignmentChange={onAlignmentChange}
            alignmentOptions={ALIGNMENT_OPTIONS}
            alignmentLabel={isEdit ? 'Card Alignment' : 'Text Alignment'}
            alignmentAriaLabel={isEdit ? 'Card Alignment' : 'Select Card Alignment'}
          />
        )
    }
  }

  return (
    <div className="content-editor-card">
      <h2>Card Element Manager</h2>
      <p className="content-editor-card-description">
        Create and configure modular card elements with layout-specific fields, nested colors, and live preview.
      </p>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button
          type="button"
          onClick={() => setMode('create')}
          style={{
            flex: 1,
            padding: '12px',
            background: mode === 'create' ? '#0f172a' : '#e2e8f0',
            color: mode === 'create' ? '#fff' : '#0f172a',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ➕ Create New Card
        </button>
        <button
          type="button"
          onClick={() => setMode('manage')}
          style={{
            flex: 1,
            padding: '12px',
            background: mode === 'manage' ? '#0f172a' : '#e2e8f0',
            color: mode === 'manage' ? '#fff' : '#0f172a',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ✏️ Manage Existing Cards
        </button>
      </div>

      {/* Subtab Toggle: Content vs Colors */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'content' ? '#0f172a' : 'transparent',
            color: activeTab === 'content' ? '#ffffff' : '#64748b',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          📝 Content & Text
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('colors')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'colors' ? '#0f172a' : 'transparent',
            color: activeTab === 'colors' ? '#ffffff' : '#64748b',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🎨 Colors & Theme
        </button>
      </div>

      {/* CREATE MODE */}
      {mode === 'create' && (
        <form onSubmit={handleCreate} style={{ marginTop: '16px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Card ID</label>
              <input
                type="text"
                value={cardId}
                onChange={(e) => { setCardId(e.target.value); markDirty() }}
                placeholder="e.g. card-specialty-service"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Card Layout</label>
              <CustomSelect
                value={layout}
                onChange={(val) => { setLayout(val); markDirty() }}
                options={CARD_LAYOUT_OPTIONS}
                ariaLabel="Select Card Layout"
              />
            </div>
          </div>

          {/* DT-923 Sprint 9 - PBall: Render separated card layout component in create mode */}
          {activeTab === 'content' && renderCardLayoutFields({
            currentLayout: layout,
            currentHeader: header,
            onHeaderChange: (val) => { setHeader(val); markDirty() },
            currentHeaderTypography: headerTypography,
            onHeaderTypographyChange: (val) => { setHeaderTypography(val); markDirty() },
            currentParagraph: paragraph,
            onParagraphChange: (val) => { setParagraph(val); markDirty() },
            currentParagraphTypography: paragraphTypography,
            onParagraphTypographyChange: (val) => { setParagraphTypography(val); markDirty() },
            currentImageUrl: imageUrl,
            onImageUrlChange: (val) => { setImageUrl(val); markDirty() },
            currentImageAlt: imageAlt,
            onImageAltChange: (val) => { setImageAlt(val); markDirty() },
            currentSymbol: symbol,
            onSymbolChange: (val) => { setSymbol(val); markDirty() },
            currentAlignment: alignment,
            onAlignmentChange: (val) => { setAlignment(val); markDirty() },
            isEdit: false
          })}

          {activeTab === 'colors' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Card Background Color</label>
                <CustomSelect value={bgColor} onChange={(val) => { setBgColor(val); markDirty() }} options={colorOptions} ariaLabel="Card Background Color" />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Header Color</label>
                <CustomSelect value={headerColor} onChange={(val) => { setHeaderColor(val); markDirty() }} options={colorOptions} ariaLabel="Card Header Color" />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Text Color</label>
                <CustomSelect value={textColor} onChange={(val) => { setTextColor(val); markDirty() }} options={colorOptions} ariaLabel="Card Text Color" />
              </div>
            </div>
          )}

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              style={{ padding: '10px 20px', background: '#0f172a', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
            >
              Create Card
            </button>
          </div>
        </form>
      )}

      {/* MANAGE MODE */}
      {mode === 'manage' && (
        <form onSubmit={handleSaveManage} style={{ marginTop: '16px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Filter by Location</label>
              <CustomSelect
                value={locationFilter}
                onChange={(val) => setLocationFilter(val)}
                options={locationFilterOptions}
                ariaLabel="Filter cards by section"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Select Card to Edit</label>
              <CustomSelect
                value={manageCardId}
                onChange={(val) => handleSelectManage(val)}
                options={filteredCards.map(c => ({ value: c.id, label: `${c.id} (${c.layout})` }))}
                placeholder="Select a Card..."
                ariaLabel="Select Card to Edit"
              />
            </div>
          </div>

          {manageCardId && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontWeight: 'bold' }}>Editing: <code>{manageCardId}</code></span>
                <button
                  type="button"
                  onClick={() => handleDelete(manageCardId)}
                  style={{ padding: '4px 10px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Delete Card
                </button>
              </div>

              {/* DT-625 Sprint 8 - Preston Ball: Allow renaming card ID */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                  Card ID (Rename)
                </label>
                <input
                  type="text"
                  required
                  value={editCardId}
                  onChange={(e) => { setEditCardId(e.target.value); markDirty() }}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Card Layout</label>
                <CustomSelect
                  value={editLayout}
                  onChange={(val) => { setEditLayout(val); markDirty() }}
                  options={CARD_LAYOUT_OPTIONS}
                  ariaLabel="Card Layout"
                />
              </div>

              {/* DT-923 Sprint 9 - PBall: Render separated card layout component in manage mode */}
              {activeTab === 'content' && renderCardLayoutFields({
                currentLayout: editLayout,
                currentHeader: editHeader,
                onHeaderChange: (val) => { setEditHeader(val); markDirty() },
                currentHeaderTypography: editHeaderTypography,
                onHeaderTypographyChange: (val) => { setEditHeaderTypography(val); markDirty() },
                currentParagraph: editParagraph,
                onParagraphChange: (val) => { setEditParagraph(val); markDirty() },
                currentParagraphTypography: editParagraphTypography,
                onParagraphTypographyChange: (val) => { setEditParagraphTypography(val); markDirty() },
                currentImageUrl: editImageUrl,
                onImageUrlChange: (val) => { setEditImageUrl(val); markDirty() },
                currentImageAlt: editImageAlt,
                onImageAltChange: (val) => { setEditImageAlt(val); markDirty() },
                currentSymbol: editSymbol,
                onSymbolChange: (val) => { setEditSymbol(val); markDirty() },
                currentAlignment: editAlignment,
                onAlignmentChange: (val) => { setEditAlignment(val); markDirty() },
                isEdit: true
              })}

              {activeTab === 'colors' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Card Background Color</label>
                    <CustomSelect value={editBgColor} onChange={(val) => { setEditBgColor(val); markDirty() }} options={colorOptions} ariaLabel="Card Background Color" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Header Color</label>
                    <CustomSelect value={editHeaderColor} onChange={(val) => { setEditHeaderColor(val); markDirty() }} options={colorOptions} ariaLabel="Card Header Color" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Text Color</label>
                    <CustomSelect value={editTextColor} onChange={(val) => { setEditTextColor(val); markDirty() }} options={colorOptions} ariaLabel="Card Text Color" />
                  </div>
                </div>
              )}

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#0f172a', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                >
                  Save Card Changes
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* Live Preview */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>Live Card Preview</h3>
          <button
            type="button"
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            style={{ padding: '6px 12px', background: '#e2e8f0', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
          >
            {themeMode === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
        <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '24px', background: themeMode === 'dark' ? '#0f172a' : '#f8fafc', maxWidth: '500px' }}>
          <ModularCard card={draftCard} theme={themeMode} />
        </div>
      </div>

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
