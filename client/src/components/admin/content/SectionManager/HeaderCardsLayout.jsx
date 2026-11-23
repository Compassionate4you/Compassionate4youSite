// DT-875 Sprint 9
// PBall
// Form fields component for the HEADER_CARDS (HeaderCardsSection) layout in SectionManager

import React from 'react'
import CustomSelect from '../CustomSelect'
import TypographyControls from '../TypographyControls'

const HEADER_POSITION_OPTIONS = [
  { value: 'left', label: 'Header on Left / Cards on Right' },
  { value: 'right', label: 'Header on Right / Cards on Left' }
]

const SURFACE_OPTIONS = [
  { value: '', label: 'Default (Light Green Surface)' },
  { value: 'white', label: 'White Surface' },
  { value: 'gray', label: 'Gray Surface (White Heading Copy)' }
]

const CARD_ICON_OPTIONS = [
  'Heart', 'HeartHandshake', 'HeartPulse', 'House', 'Stethoscope', 'Activity', 'Accessibility',
  'Cross', 'Speech', 'Users', 'Languages', 'ClipboardCheck', 'ClipboardList', 'Coins',
  'TrendingUp', 'ShieldCheck', 'GraduationCap', 'Wind', 'Bone', 'Bandage', 'Droplets',
  'Pill', 'FlaskConical', 'Apple', 'TestTube', 'Clock', 'BriefcaseMedical', 'Church',
  'HandHelping', 'CalendarDays', 'Phone', 'FileCheck'
].map(icon => ({ value: icon, label: icon }))

export default function HeaderCardsLayout ({
  label = '',
  onLabelChange,
  header,
  onHeaderChange,
  headerTypography,
  onHeaderTypographyChange,
  text,
  onTextChange,
  textTypography,
  onTextTypographyChange,
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
    if (!onBenefitItemsChange) return
    onBenefitItemsChange([...benefitItems, { heading: '', description: '', iconName: 'Heart' }])
  }

  const handleUpdateInlineItem = (idx, patch) => {
    if (!onBenefitItemsChange) return
    const next = benefitItems.map((item, i) => (i === idx ? { ...item, ...patch } : item))
    onBenefitItemsChange(next)
  }

  const handleMoveInlineItem = (idx, dir) => {
    if (!onBenefitItemsChange) return
    const target = idx + dir
    if (target < 0 || target >= benefitItems.length) return
    const next = [...benefitItems]
    const temp = next[idx]
    next[idx] = next[target]
    next[target] = temp
    onBenefitItemsChange(next)
  }

  const handleRemoveInlineItem = (idx) => {
    if (!onBenefitItemsChange) return
    onBenefitItemsChange(benefitItems.filter((_, i) => i !== idx))
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
          {onHeaderTypographyChange && (
            <TypographyControls
              label="Header Typography & Alignment"
              value={headerTypography}
              onChange={onHeaderTypographyChange}
            />
          )}
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
        {onTextTypographyChange && (
          <TypographyControls
            label="Subtitle Typography & Alignment"
            value={textTypography}
            onChange={onTextTypographyChange}
          />
        )}
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
          Assigned Cards &amp; Numbering Order (Optional — resolved from Card Manager)
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
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>No cards allocated from Card Manager.</p>
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

      {onBenefitItemsChange && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontWeight: '600', fontSize: '13px' }}>
              Inline Card Items ({benefitItems.length}) — Start lines with &quot;- &quot; for bullet lists
            </label>
            <button
              type="button"
              onClick={handleAddInlineItem}
              style={{ padding: '4px 10px', fontSize: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              + Add Inline Item
            </button>
          </div>
          {benefitItems.map((item, idx) => (
            <div key={idx} style={{ background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Inline Card #{idx + 1}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button type="button" title="Move Up" disabled={idx === 0} onClick={() => handleMoveInlineItem(idx, -1)} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>▲</button>
                  <button type="button" title="Move Down" disabled={idx === benefitItems.length - 1} onClick={() => handleMoveInlineItem(idx, 1)} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: idx === benefitItems.length - 1 ? 'not-allowed' : 'pointer' }}>▼</button>
                  <button type="button" title="Remove Item" onClick={() => handleRemoveInlineItem(idx)} style={{ padding: '2px 6px', fontSize: '0.75rem', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>- Remove</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '6px' }}>
                <input
                  type="text"
                  value={item.heading || item.title || ''}
                  onChange={(e) => handleUpdateInlineItem(idx, { heading: e.target.value })}
                  placeholder="Card title (optional)"
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
                <CustomSelect
                  value={item.iconName || item.symbol || 'Heart'}
                  onChange={(val) => handleUpdateInlineItem(idx, { iconName: val })}
                  options={CARD_ICON_OPTIONS}
                  ariaLabel={`Icon for card ${idx + 1}`}
                />
              </div>
              <textarea
                rows={2}
                value={item.description || ''}
                onChange={(e) => handleUpdateInlineItem(idx, { description: e.target.value })}
                placeholder="Card description or bullet lines (- item)"
                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
