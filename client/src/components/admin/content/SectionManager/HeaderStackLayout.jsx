// DT-875 Sprint 9
// PBall
// Form fields component for the HEADER_STACK (HeaderStackSection) layout in SectionManager

import React from 'react'
import CustomSelect from '../CustomSelect'

const STACK_COLUMN_OPTIONS = [
  { value: '1', label: '1 Column (Full-Width Stack)' },
  { value: '2', label: '2 Columns (Side-by-Side Stack)' }
]

export default function HeaderStackLayout ({
  label = '',
  onLabelChange,
  header,
  onHeaderChange,
  text,
  onTextChange,
  gridCols = 1,
  onGridColsChange,
  selectedCardIds = [],
  onSelectedCardIdsChange,
  cardToAdd = '',
  onCardToAddChange,
  allCards = [],
  onMoveCard,
  onRemoveCard,
  benefitItems = [],
  onBenefitItemsChange
}) {
  const handleAddCard = () => {
    if (cardToAdd && !selectedCardIds.includes(cardToAdd)) {
      onSelectedCardIdsChange([...selectedCardIds, cardToAdd])
      onCardToAddChange('')
    }
  }

  const handleAddInlineItem = () => {
    onBenefitItemsChange([...benefitItems, { heading: '', description: '' }])
  }

  const handleHeadingChange = (idx, value) => {
    const next = benefitItems.map((item, i) => (i === idx ? { ...item, heading: value } : item))
    onBenefitItemsChange(next)
  }

  const handleDescriptionChange = (idx, value) => {
    const next = benefitItems.map((item, i) => (i === idx ? { ...item, description: value } : item))
    onBenefitItemsChange(next)
  }

  const handleMoveItem = (idx, dir) => {
    const target = idx + dir
    if (target < 0 || target >= benefitItems.length) return
    const next = [...benefitItems]
    const temp = next[idx]
    next[idx] = next[target]
    next[target] = temp
    onBenefitItemsChange(next)
  }

  const handleRemoveItem = (idx) => {
    onBenefitItemsChange(benefitItems.filter((_, i) => i !== idx))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* DT-875 Sprint 9 - PBall: Eyebrow label, title, subtitle, and column count */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Eyebrow Label (Optional)</label>
          <input
            type="text"
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
            placeholder="e.g. OVERVIEW"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Section Title</label>
          <input
            type="text"
            value={header}
            onChange={(e) => onHeaderChange(e.target.value)}
            placeholder="e.g. Understanding Hospice Care"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Stack Columns (1-2)</label>
          <CustomSelect
            value={String(gridCols === 2 ? 2 : 1)}
            onChange={(val) => onGridColsChange(Number(val))}
            options={STACK_COLUMN_OPTIONS}
            ariaLabel="Select Stack Columns"
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Subtitle / Description (Optional)</label>
        <textarea
          rows={2}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Optional introductory text below the heading..."
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
      </div>

      {/* DT-875 Sprint 9 - PBall: Assign existing cards or define inline stack items */}
      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>
          Assigned Cards (Optional — resolved from Card Manager)
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <div style={{ flex: 1 }}>
            <CustomSelect
              value={cardToAdd}
              onChange={onCardToAddChange}
              options={allCards.map(c => ({ value: c.id, label: `${c.id} (${c.layout})` }))}
              placeholder="-- Choose card to add --"
              ariaLabel="Choose card to add"
            />
          </div>
          <button
            type="button"
            onClick={handleAddCard}
            style={{ padding: '8px 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Add Card
          </button>
        </div>
        {selectedCardIds.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
            {selectedCardIds.map((cid, idx) => (
              <div key={cid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', fontSize: '0.85rem' }}>
                <span><strong>{idx + 1}.</strong> <code>{cid}</code></span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button type="button" title="Move Up" onClick={() => onMoveCard(idx, -1)} disabled={idx === 0} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>▲</button>
                  <button type="button" title="Move Down" onClick={() => onMoveCard(idx, 1)} disabled={idx === selectedCardIds.length - 1} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: idx === selectedCardIds.length - 1 ? 'not-allowed' : 'pointer' }}>▼</button>
                  <button type="button" title="Remove Card" onClick={() => onRemoveCard(idx)} style={{ padding: '2px 6px', fontSize: '0.75rem', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>- Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DT-875 Sprint 9 - PBall: Inline stack items editor */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontWeight: '600', fontSize: '13px' }}>Inline Stack Items ({benefitItems.length})</label>
          <button
            type="button"
            onClick={handleAddInlineItem}
            style={{ padding: '4px 10px', fontSize: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            + Add Stack Item
          </button>
        </div>
        {benefitItems.map((item, idx) => (
          <div key={idx} style={{ background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Stack Card #{idx + 1}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button type="button" title="Move Up" disabled={idx === 0} onClick={() => handleMoveItem(idx, -1)} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>▲</button>
                <button type="button" title="Move Down" disabled={idx === benefitItems.length - 1} onClick={() => handleMoveItem(idx, 1)} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: idx === benefitItems.length - 1 ? 'not-allowed' : 'pointer' }}>▼</button>
                <button type="button" title="Remove Item" onClick={() => handleRemoveItem(idx)} style={{ padding: '2px 6px', fontSize: '0.75rem', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>- Remove</button>
              </div>
            </div>
            <input
              type="text"
              value={item.heading || item.title || ''}
              onChange={(e) => handleHeadingChange(idx, e.target.value)}
              placeholder="Card title"
              style={{ width: '100%', marginBottom: '6px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
            <textarea
              rows={2}
              value={item.description || ''}
              onChange={(e) => handleDescriptionChange(idx, e.target.value)}
              placeholder="Card body description (optional)"
              style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
