// DT-875 Sprint 9
// PBall
// Form fields component for the TIMELINE_SECTION (TimelineSection) layout in SectionManager

import React from 'react'
import CustomSelect from '../CustomSelect'

export default function TimelineSectionLayout ({
  label = '',
  onLabelChange,
  header,
  onHeaderChange,
  text,
  onTextChange,
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

  const handleAddStep = () => {
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

  const handleMoveStep = (idx, dir) => {
    const target = idx + dir
    if (target < 0 || target >= benefitItems.length) return
    const next = [...benefitItems]
    const temp = next[idx]
    next[idx] = next[target]
    next[target] = temp
    onBenefitItemsChange(next)
  }

  const handleRemoveStep = (idx) => {
    onBenefitItemsChange(benefitItems.filter((_, i) => i !== idx))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* DT-875 Sprint 9 - PBall: Eyebrow label, title, and subtitle for TimelineSection */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Eyebrow Label (Optional)</label>
          <input
            type="text"
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
            placeholder="e.g. CARE PROCESS"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Timeline Title</label>
          <input
            type="text"
            value={header}
            onChange={(e) => onHeaderChange(e.target.value)}
            placeholder="e.g. Our 5-Step Hospice Care Process"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
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

      {/* DT-875 Sprint 9 - PBall: Assign cards as timeline steps or edit inline steps */}
      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>
          Assigned Step Cards (Optional — resolved in order from Card Manager)
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <div style={{ flex: 1 }}>
            <CustomSelect
              value={cardToAdd}
              onChange={onCardToAddChange}
              options={allCards.map(c => ({ value: c.id, label: `${c.id} (${c.layout})` }))}
              placeholder="-- Choose step card to add --"
              ariaLabel="Choose step card to add"
            />
          </div>
          <button
            type="button"
            onClick={handleAddCard}
            style={{ padding: '8px 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Add Step Card
          </button>
        </div>
        {selectedCardIds.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
            {selectedCardIds.map((cid, idx) => (
              <div key={cid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', fontSize: '0.85rem' }}>
                <span><strong>Step {idx + 1}.</strong> <code>{cid}</code></span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button type="button" title="Move Up" onClick={() => onMoveCard(idx, -1)} disabled={idx === 0} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>▲</button>
                  <button type="button" title="Move Down" onClick={() => onMoveCard(idx, 1)} disabled={idx === selectedCardIds.length - 1} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: idx === selectedCardIds.length - 1 ? 'not-allowed' : 'pointer' }}>▼</button>
                  <button type="button" title="Remove Step Card" onClick={() => onRemoveCard(idx)} style={{ padding: '2px 6px', fontSize: '0.75rem', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>- Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DT-875 Sprint 9 - PBall: Inline timeline steps editor */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontWeight: '600', fontSize: '13px' }}>
            Inline Timeline Steps ({benefitItems.length}) — Horizontal for up to 5 steps, vertical for 6+
          </label>
          <button
            type="button"
            onClick={handleAddStep}
            style={{ padding: '4px 10px', fontSize: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            + Add Step
          </button>
        </div>
        {benefitItems.map((item, idx) => (
          <div key={idx} style={{ background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Step #{idx + 1}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button type="button" title="Move Up" disabled={idx === 0} onClick={() => handleMoveStep(idx, -1)} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>▲</button>
                <button type="button" title="Move Down" disabled={idx === benefitItems.length - 1} onClick={() => handleMoveStep(idx, 1)} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: idx === benefitItems.length - 1 ? 'not-allowed' : 'pointer' }}>▼</button>
                <button type="button" title="Remove Step" onClick={() => handleRemoveStep(idx)} style={{ padding: '2px 6px', fontSize: '0.75rem', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>- Remove</button>
              </div>
            </div>
            <input
              type="text"
              value={item.heading || item.title || ''}
              onChange={(e) => handleHeadingChange(idx, e.target.value)}
              placeholder="Step title (e.g. Initial Consultation)"
              style={{ width: '100%', marginBottom: '6px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
            <textarea
              rows={2}
              value={item.description || ''}
              onChange={(e) => handleDescriptionChange(idx, e.target.value)}
              placeholder="Step description"
              style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
