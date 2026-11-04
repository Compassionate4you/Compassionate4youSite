// DT-923 Sprint 9
// PBall
// Form fields component for the CARD_GRID section layout in SectionManager

import React from 'react'
import CustomSelect from '../CustomSelect'
import TypographyControls from '../TypographyControls'

const GRID_COL_OPTIONS = [
  { value: '1', label: '1 Column' },
  { value: '2', label: '2 Columns' },
  { value: '3', label: '3 Columns' },
  { value: '4', label: '4 Columns' }
]

export default function CardGridLayout ({
  header,
  onHeaderChange,
  headerTypography,
  onHeaderTypographyChange,
  gridCols,
  onGridColsChange,
  selectedCardIds,
  onSelectedCardIdsChange,
  cardToAdd,
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
      {/* DT-923 Sprint 9 - PBall: Section title and typography controls */}
      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Title / Header</label>
        <input
          type="text"
          value={header}
          onChange={(e) => onHeaderChange(e.target.value)}
          placeholder="Primary section header"
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <TypographyControls
          label="Header Typography & Alignment"
          value={headerTypography}
          onChange={onHeaderTypographyChange}
        />
      </div>

      {/* DT-923 Sprint 9 - PBall: CARD_GRID column count and card ordering controls */}
      <div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Grid Columns (1-4)</label>
          <CustomSelect
            value={String(gridCols)}
            onChange={(val) => onGridColsChange(Number(val))}
            options={GRID_COL_OPTIONS}
            style={{ width: '140px' }}
            ariaLabel="Select column count"
          />
        </div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>Section Cards &amp; Display Order</label>
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
    </div>
  )
}
