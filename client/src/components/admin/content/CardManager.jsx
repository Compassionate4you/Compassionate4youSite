// DT-513 Sprint 7
// PBall
// Card Element Manager component supporting layouts and live preview

import React, { useState } from 'react'
import { CardStorageService } from '../../../services/cardStorageService'
import { ColorConfigService } from '../../../services/colorConfigService'
import { AuditHistoryService } from '../../../services/auditHistoryService'
import DynamicSectionRenderer from '../../modular/DynamicSectionRenderer'

export default function CardManager ({ onNotification }) {
  const [cards, setCards] = useState(CardStorageService.getCards())
  const colors = ColorConfigService.getColors()

  const [cardId, setCardId] = useState('')
  const [layout, setLayout] = useState('HEADER_TEXT_BOX')
  const [header, setHeader] = useState('')
  const [text, setText] = useState('')
  const [themeMode, setThemeMode] = useState('light')

  const draftCard = {
    id: cardId || 'preview-card',
    layout,
    colors: { backgroundColor: colors[0]?.id, headerColor: colors[1]?.id, textColor: colors[2]?.id },
    content: { header: header || 'Card Header', text: text || 'Card text description...' }
  }

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
    } catch (err) { alert(err.message) }
  }

  return (
    <div className="content-editor-card">
      <h2>Card Element Manager</h2>
      <p className="content-editor-card-description">Create and configure card elements with layouts and live preview.</p>

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

      <div style={{ marginTop: '20px', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h4>Live Card Preview</h4>
          <button type="button" onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')} style={{ padding: '4px 8px', background: '#e2e8f0', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>{themeMode === 'light' ? '🌙 Dark' : '☀️ Light'}</button>
        </div>
        <DynamicSectionRenderer config={{ layout: 'CARD_GRID', content: { gridCols: 1 }, cards: [draftCard] }} theme={themeMode} />
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Cards ({cards.length})</h3>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px' }}>
          {cards.map(c => (
            <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '6px' }}>
              <span><strong>{c.id}</strong> ({c.layout})</span>
              <button type="button" onClick={() => handleDelete(c.id)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}>Del</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
