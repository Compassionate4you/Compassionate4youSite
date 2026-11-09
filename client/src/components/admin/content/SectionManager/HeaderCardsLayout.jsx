// DT-875 Sprint 9
// PBall
// Form fields component for the HEADER_CARDS (HeaderCardsSection) layout in SectionManager

import React from 'react'
import CustomSelect from '../CustomSelect'

const HEADER_POSITION_OPTIONS = [
  { value: 'left', label: 'Header on Left / Cards on Right' },
  { value: 'right', label: 'Header on Right / Cards on Left' }
]

const SURFACE_OPTIONS = [
  { value: '', label: 'Default (Light Green Surface)' },
  { value: 'white', label: 'White Surface' },
  { value: 'gray', label: 'Gray Surface (White Heading Copy)' }
]

export default function HeaderCardsLayout ({
  label = '',
  onLabelChange,
  header,
  onHeaderChange,
  text,
  onTextChange,
  headerPosition = 'left',
  onHeaderPositionChange,
  surface = '',
  onSurfaceChange,
  imageUrl,
  onImageUrlChange,
  selectedCardIds = [],
  onSelectedCardIdsChange,
  cardToAdd = '',
  onCardToAddChange,
  allCards = [],
  onMoveCard,
  onRemoveCard
}) {
  const handleAddCard = () => {
    if (cardToAdd && !selectedCardIds.includes(cardToAdd)) {
      onSelectedCardIdsChange([...selectedCardIds, cardToAdd])
      onCardToAddChange('')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* DT-875 Sprint 9 - PBall: Eyebrow label, title, and subtitle fields for HeaderCardsSection */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Eyebrow Label (Optional)</label>
          <input
            type="text"
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
            placeholder="e.g. OUR CARE"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Section Title</label>
          <input
            type="text"
            value={header}
            onChange={(e) => onHeaderChange(e.target.value)}
            placeholder="e.g. Our Home Health Services"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Subtitle / Introductory Text (Optional)</label>
        <textarea
          rows={3}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Enter introductory copy displayed under the section heading..."
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
      </div>

      {/* DT-875 Sprint 9 - PBall: Header position, surface variant, and decorative background image */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Header Placement</label>
          <CustomSelect
            value={headerPosition}
            onChange={onHeaderPositionChange}
            options={HEADER_POSITION_OPTIONS}
            ariaLabel="Select Header Placement"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Section Surface</label>
          <CustomSelect
            value={surface}
            onChange={onSurfaceChange}
            options={SURFACE_OPTIONS}
            ariaLabel="Select Section Surface"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Decorative Background Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder="Optional background image URL"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
      </div>

      {/* DT-875 Sprint 9 - PBall: Allocated cards list for numbered icon cards */}
      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>
          Assigned Cards &amp; Numbering Order
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
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

        {selectedCardIds.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>No cards allocated to this section.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {selectedCardIds.map((cid, idx) => (
              <div key={cid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', fontSize: '0.85rem' }}>
                <span><strong>#{idx + 1}.</strong> <code>{cid}</code></span>
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
    </div>
  )
}
