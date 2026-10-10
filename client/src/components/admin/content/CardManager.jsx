// DT-513 Sprint 7
// PBall
// Card Element Manager component supporting layouts and live preview

import React, { useState } from 'react'
import { CardStorageService } from '../../../services/cardStorageService'
import { SectionStorageService } from '../../../services/sectionStorageService'
import { ColorConfigService } from '../../../services/colorConfigService'
import { AuditHistoryService } from '../../../services/auditHistoryService'
import DynamicSectionRenderer from '../../modular/DynamicSectionRenderer'

export default function CardManager ({ onNotification }) {
  const [cards, setCards] = useState(CardStorageService.getCards())
  const colors = ColorConfigService.getColors()
  const sections = SectionStorageService.getSections()

  const [mode, setMode] = useState('create')

  const [cardId, setCardId] = useState('')
  const [layout, setLayout] = useState('HEADER_TEXT_BOX')
  const [header, setHeader] = useState('')
  const [text, setText] = useState('')
  const [themeMode, setThemeMode] = useState('light')

  const [locationFilter, setLocationFilter] = useState('all')
  const [manageCardId, setManageCardId] = useState('')

  const [editLayout, setEditLayout] = useState('HEADER_TEXT_BOX')
  const [editHeader, setEditHeader] = useState('')
  const [editText, setEditText] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editFacing, setEditFacing] = useState('left')
  const [editIconName, setEditIconName] = useState('Heart')
  
  const [editBgColor, setEditBgColor] = useState('')
  const [editHeaderColor, setEditHeaderColor] = useState('')
  const [editTextColor, setEditTextColor] = useState('')
  const [editAccentColor, setEditAccentColor] = useState('')

  const handleCreate = (e) => {
    e.preventDefault()
    try {
      const created = CardStorageService.createCard({ id: cardId, layout, content: { header, text } })
      setCards(CardStorageService.getCards())
      AuditHistoryService.recordAppliedChange({ additions: [{ type: 'card', id: created.id, data: created }] })
      setCardId(''); setHeader(''); setText('')
      onNotification(`Created card "${created.id}"`)
    } catch (err) { alert(err.message) }
  }

  const handleDelete = (id) => {
    if (!window.confirm(`Delete card "${id}"?`)) return
    try {
      const removed = CardStorageService.deleteCard(id)
      setCards(CardStorageService.getCards())
      AuditHistoryService.recordAppliedChange({ deletions: [{ type: 'card', id, data: removed }] })
      onNotification(`Deleted card "${id}"`)
      if (manageCardId === id) setManageCardId('')
    } catch (err) { alert(err.message) }
  }

  const filteredCards = cards.filter(c => {
    if (locationFilter === 'all') return true
    if (locationFilter === 'unallocated') {
      return !sections.some(s => s.content?.cardIds?.includes(c.id))
    }
    const sec = sections.find(s => s.id === locationFilter)
    return sec && sec.content?.cardIds?.includes(c.id)
  })

  const handleSelectManage = (id) => {
    setManageCardId(id)
    if (id) {
      const c = CardStorageService.getCardById(id)
      setEditLayout(c.layout || 'HEADER_TEXT_BOX')
      setEditHeader(c.content?.header || '')
      setEditText(c.content?.text || '')
      setEditImageUrl(c.content?.imageUrl || '')
      setEditFacing(c.content?.facing || 'left')
      setEditIconName(c.content?.iconName || 'Heart')
      setEditBgColor(c.colors?.backgroundColor || '')
      setEditHeaderColor(c.colors?.headerColor || '')
      setEditTextColor(c.colors?.textColor || '')
      setEditAccentColor(c.colors?.accentColor || '')
    }
  }

  const handleSaveManage = (e) => {
    e.preventDefault()
    try {
      const oldCard = CardStorageService.getCardById(manageCardId)
      const updated = CardStorageService.updateCard(manageCardId, {
        layout: editLayout,
        colors: { backgroundColor: editBgColor, headerColor: editHeaderColor, textColor: editTextColor, accentColor: editAccentColor },
        content: { ...oldCard.content, header: editHeader, text: editText, imageUrl: editImageUrl, facing: editFacing, iconName: editIconName }
      })
      setCards(CardStorageService.getCards())
      AuditHistoryService.recordAppliedChange({ edits: { [`card.${manageCardId}`]: { before: oldCard, after: updated } } })
      onNotification(`Updated card "${manageCardId}"`)
    } catch (err) { alert(err.message) }
  }

  const draftCard = mode === 'create' ? {
    id: cardId || 'preview-card',
    layout,
    colors: { backgroundColor: colors[0]?.id, headerColor: colors[1]?.id, textColor: colors[2]?.id },
    content: { header: header || 'Card Header', text: text || 'Card text description...' }
  } : {
    id: manageCardId || 'preview-card',
    layout: editLayout,
    colors: { backgroundColor: editBgColor, headerColor: editHeaderColor, textColor: editTextColor, accentColor: editAccentColor },
    content: { header: editHeader, text: editText, imageUrl: editImageUrl, facing: editFacing, iconName: editIconName }
  }

  return (
    <div className="content-editor-card">
      <h2>Card Element Manager</h2>
      <p className="content-editor-card-description">Create and configure card elements with layouts and live preview.</p>

      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button type="button" onClick={() => setMode('create')} style={{ flex: 1, padding: '10px', background: mode === 'create' ? '#0f172a' : '#e2e8f0', color: mode === 'create' ? '#fff' : '#000', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>➕ Create New Card</button>
        <button type="button" onClick={() => setMode('manage')} style={{ flex: 1, padding: '10px', background: mode === 'manage' ? '#0f172a' : '#e2e8f0', color: mode === 'manage' ? '#fff' : '#000', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>✏️ Manage Existing Cards</button>
      </div>

      {mode === 'create' && (
        <form onSubmit={handleCreate} style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
          <h3>Create New Card</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
            <input type="text" value={cardId} onChange={(e) => setCardId(e.target.value)} placeholder="Card ID" required style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <select value={layout} onChange={(e) => setLayout(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="HEADER_TEXT_BOX">HEADER_TEXT_BOX</option>
              <option value="FULL_WIDTH_SPLIT">FULL_WIDTH_SPLIT</option>
              <option value="HEADER_VECTOR_GRAPHIC">HEADER_VECTOR_GRAPHIC</option>
            </select>
          </div>
          <input type="text" value={header} onChange={(e) => setHeader(e.target.value)} placeholder="Header title" required style={{ width: '100%', marginTop: '10px', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
          <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Description text" style={{ width: '100%', marginTop: '10px', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
          <button type="submit" style={{ marginTop: '12px', padding: '8px 16px', background: '#0f172a', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Create Card</button>
        </form>
      )}

      {mode === 'manage' && (
        <form onSubmit={handleSaveManage} style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
          <h3>Manage Cards</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
            <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="all">All Cards</option>
              <option value="unallocated">Unallocated Cards</option>
              {sections.map(s => <option key={s.id} value={s.id}>Section: {s.id}</option>)}
            </select>
            <select value={manageCardId} onChange={(e) => handleSelectManage(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="">Select a Card...</option>
              {filteredCards.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
            </select>
          </div>

          {manageCardId && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                <select value={editLayout} onChange={(e) => setEditLayout(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  <option value="HEADER_TEXT_BOX">HEADER_TEXT_BOX</option>
                  <option value="FULL_WIDTH_SPLIT">FULL_WIDTH_SPLIT</option>
                  <option value="HEADER_VECTOR_GRAPHIC">HEADER_VECTOR_GRAPHIC</option>
                </select>
                <input type="text" value={editHeader} onChange={(e) => setEditHeader(e.target.value)} placeholder="Header title" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <textarea rows={2} value={editText} onChange={(e) => setEditText(e.target.value)} placeholder="Description text" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input type="text" value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} placeholder="Image URL" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  <input type="text" value={editIconName} onChange={(e) => setEditIconName(e.target.value)} placeholder="Icon Name (e.g. Heart)" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  <select value={editFacing} onChange={(e) => setEditFacing(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                    <option value="left">Left Facing</option>
                    <option value="right">Right Facing</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '16px', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Applied Colors Config</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Background Color</label>
                    <select value={editBgColor} onChange={(e) => setEditBgColor(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Default</option>
                      {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Header Color</label>
                    <select value={editHeaderColor} onChange={(e) => setEditHeaderColor(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Default</option>
                      {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Text Color</label>
                    <select value={editTextColor} onChange={(e) => setEditTextColor(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Default</option>
                      {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Accent/Graphic Color</label>
                    <select value={editAccentColor} onChange={(e) => setEditAccentColor(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Default</option>
                      {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '8px 16px', background: '#0f172a', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Save Changes</button>
                <button type="button" onClick={() => handleDelete(manageCardId)} style={{ padding: '8px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          )}
        </form>
      )}

      {(mode === 'create' || manageCardId) && (
        <div style={{ marginTop: '20px', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4>Live Card Preview</h4>
            <button type="button" onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')} style={{ padding: '4px 8px', background: '#e2e8f0', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>{themeMode === 'light' ? '🌙 Dark' : '☀️ Light'}</button>
          </div>
          <DynamicSectionRenderer config={{ layout: 'CARD_GRID', content: { gridCols: 1 }, cards: [draftCard] }} theme={themeMode} />
        </div>
      )}
    </div>
  )
}