// DT-622 DT-618 Sprint 8
// Preston Ball
// Card Element Manager component supporting layout-specific dynamic fields, content/color tabs, and live preview

import React, { useState } from 'react'
import { CardStorageService } from '../../../services/cardStorageService'
import { SectionStorageService } from '../../../services/sectionStorageService'
import { ColorConfigService } from '../../../services/colorConfigService'
import { AuditHistoryService } from '../../../services/auditHistoryService'
import ModularCard from '../../modular/cards/ModularCard'

const SYMBOL_OPTIONS = [
  'Heart', 'Check', 'Home', 'Stethoscope', 'Users', 'Phone',
  'Pill', 'Activity', 'Star', 'Shield', 'ShieldCheck', 'Award', 'Smile'
]

export default function CardManager ({ onNotification }) {
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
  const [editLayout, setEditLayout] = useState('HEADER_PARAGRAPH')
  const [editHeader, setEditHeader] = useState('')
  const [editParagraph, setEditParagraph] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editImageAlt, setEditImageAlt] = useState('')
  const [editSymbol, setEditSymbol] = useState('Heart')
  const [editAlignment, setEditAlignment] = useState('left')
  const [editBgColor, setEditBgColor] = useState('')
  const [editHeaderColor, setEditHeaderColor] = useState('')
  const [editTextColor, setEditTextColor] = useState('')

  const handleSelectManage = (id) => {
    setManageCardId(id)
    if (id) {
      const c = CardStorageService.getCardById(id)
      const data = c.content || {}
      const col = data.colors || c.colors || {}
      setEditLayout(c.layout || c.layoutType || 'HEADER_PARAGRAPH')
      setEditHeader(data.header || '')
      setEditParagraph(data.paragraph || data.text || '')
      setEditImageUrl(data.imageUrl || '')
      setEditImageAlt(data.imageAlt || '')
      setEditSymbol(data.symbol || data.iconName || 'Heart')
      setEditAlignment(data.alignment || data.facing || 'left')
      setEditBgColor(col.backgroundColor || '')
      setEditHeaderColor(col.headerColor || '')
      setEditTextColor(col.textColor || '')
    }
  }

  const handleCreate = (e) => {
    e.preventDefault()
    const trimmedId = cardId.trim()
    if (!trimmedId) {
      alert('Please enter a Card ID.')
      return
    }

    try {
      const cardContent = {
        header,
        paragraph,
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
      onNotification(`Created card "${created.id}"`)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleSaveManage = (e) => {
    e.preventDefault()
    if (!manageCardId) return
    try {
      const oldCard = CardStorageService.getCardById(manageCardId)
      const updatedContent = {
        ...oldCard.content,
        header: editHeader,
        paragraph: editParagraph,
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

      const updated = CardStorageService.updateCard(manageCardId, {
        layout: editLayout,
        content: updatedContent
      })
      setCards(CardStorageService.getCards())
      AuditHistoryService.recordAppliedChange({
        edits: { [`card.${manageCardId}`]: { before: oldCard, after: updated } }
      })
      onNotification(`Updated card "${manageCardId}"`)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = (id) => {
    if (!window.confirm(`Delete card "${id}"?`)) return
    try {
      const removed = CardStorageService.deleteCard(id)
      setCards(CardStorageService.getCards())
      AuditHistoryService.recordAppliedChange({
        deletions: [{ type: 'card', id, data: removed }]
      })
      onNotification(`Deleted card "${id}"`)
      if (manageCardId === id) setManageCardId('')
    } catch (err) {
      alert(err.message)
    }
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
    imageUrl: imageUrl || '/assets/images/CareImage1.jpeg',
    imageAlt: imageAlt || 'Card image preview',
    symbol,
    alignment,
    colors: { backgroundColor: bgColor, headerColor, textColor }
  } : {
    header: editHeader || 'Card Header',
    paragraph: editParagraph || 'Card paragraph',
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
                onChange={(e) => setCardId(e.target.value)}
                placeholder="e.g. card-specialty-service"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Card Layout</label>
              <select
                value={layout}
                onChange={(e) => setLayout(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="HEADER_PARAGRAPH">HEADER_PARAGRAPH (Title & bullet text)</option>
                <option value="IMAGE_FULL_WIDTH">IMAGE_FULL_WIDTH (Split image and content)</option>
                <option value="HEADER_SYMBOL">HEADER_SYMBOL (Icon badge & title)</option>
              </select>
            </div>
          </div>

          {activeTab === 'content' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Card Header</label>
                <input
                  type="text"
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  placeholder="Card title"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              {['HEADER_PARAGRAPH', 'IMAGE_FULL_WIDTH'].includes(layout) && (
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                    Paragraph Body (Lines starting with "- " render as bullet items)
                  </label>
                  <textarea
                    rows={4}
                    value={paragraph}
                    onChange={(e) => setParagraph(e.target.value)}
                    placeholder="Enter card description..."
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              )}

              {layout === 'IMAGE_FULL_WIDTH' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Image URL</label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="/images/older_couple_smiling.jpeg"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Image Alt</label>
                    <input
                      type="text"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="Image description"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Image Alignment</label>
                    <select
                      value={alignment}
                      onChange={(e) => setAlignment(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="left">Image on Left</option>
                      <option value="right">Image on Right</option>
                    </select>
                  </div>
                </div>
              )}

              {layout === 'HEADER_SYMBOL' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Symbol Icon</label>
                    <select
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      {SYMBOL_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Alignment</label>
                    <select
                      value={alignment}
                      onChange={(e) => setAlignment(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="center">Center</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              )}

              {layout === 'HEADER_PARAGRAPH' && (
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Text Alignment</label>
                  <select
                    value={alignment}
                    onChange={(e) => setAlignment(e.target.value)}
                    style={{ width: '160px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="left">Left Aligned</option>
                    <option value="center">Centered</option>
                    <option value="right">Right Aligned</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {activeTab === 'colors' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Card Background Color</label>
                <select value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="">Default Theme</option>
                  {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Header Color</label>
                <select value={headerColor} onChange={(e) => setHeaderColor(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="">Default Theme</option>
                  {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Text Color</label>
                <select value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="">Default Theme</option>
                  {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                </select>
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
              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="all">All Cards</option>
                <option value="unallocated">Unallocated Cards</option>
                {sections.map(s => <option key={s.id} value={s.id}>Section: {s.id}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Select Card to Edit</label>
              <select value={manageCardId} onChange={(e) => handleSelectManage(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="">Select a Card...</option>
                {filteredCards.map(c => <option key={c.id} value={c.id}>{c.id} ({c.layout})</option>)}
              </select>
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

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Card Layout</label>
                <select
                  value={editLayout}
                  onChange={(e) => setEditLayout(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="HEADER_PARAGRAPH">HEADER_PARAGRAPH</option>
                  <option value="IMAGE_FULL_WIDTH">IMAGE_FULL_WIDTH</option>
                  <option value="HEADER_SYMBOL">HEADER_SYMBOL</option>
                </select>
              </div>

              {activeTab === 'content' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Card Header</label>
                    <input
                      type="text"
                      value={editHeader}
                      onChange={(e) => setEditHeader(e.target.value)}
                      placeholder="Card title"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  {['HEADER_PARAGRAPH', 'IMAGE_FULL_WIDTH'].includes(editLayout) && (
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                        Paragraph Body (Lines starting with "- " render as bullet items)
                      </label>
                      <textarea
                        rows={4}
                        value={editParagraph}
                        onChange={(e) => setEditParagraph(e.target.value)}
                        placeholder="Enter card description..."
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  )}

                  {editLayout === 'IMAGE_FULL_WIDTH' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Image URL</label>
                        <input
                          type="text"
                          value={editImageUrl}
                          onChange={(e) => setEditImageUrl(e.target.value)}
                          placeholder="/images/older_couple_smiling.jpeg"
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Image Alt</label>
                        <input
                          type="text"
                          value={editImageAlt}
                          onChange={(e) => setEditImageAlt(e.target.value)}
                          placeholder="Image description"
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Image Alignment</label>
                        <select
                          value={editAlignment}
                          onChange={(e) => setEditAlignment(e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                          <option value="left">Image on Left</option>
                          <option value="right">Image on Right</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {editLayout === 'HEADER_SYMBOL' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Symbol Icon</label>
                        <select
                          value={editSymbol}
                          onChange={(e) => setEditSymbol(e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                          {SYMBOL_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Alignment</label>
                        <select
                          value={editAlignment}
                          onChange={(e) => setEditAlignment(e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                          <option value="center">Center</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {editLayout === 'HEADER_PARAGRAPH' && (
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Text Alignment</label>
                      <select
                        value={editAlignment}
                        onChange={(e) => setEditAlignment(e.target.value)}
                        style={{ width: '160px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      >
                        <option value="left">Left Aligned</option>
                        <option value="center">Centered</option>
                        <option value="right">Right Aligned</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'colors' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Card Background Color</label>
                    <select value={editBgColor} onChange={(e) => setEditBgColor(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="">Default Theme</option>
                      {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Header Color</label>
                    <select value={editHeaderColor} onChange={(e) => setEditHeaderColor(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="">Default Theme</option>
                      {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Text Color</label>
                    <select value={editTextColor} onChange={(e) => setEditTextColor(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="">Default Theme</option>
                      {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
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
    </div>
  )
}
