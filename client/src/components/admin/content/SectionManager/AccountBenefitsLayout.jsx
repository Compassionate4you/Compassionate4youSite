// DT-923 Sprint 9
// PBall
// Form fields component for the ACCOUNT_BENEFITS section layout in SectionManager

import React from 'react'
import TypographyControls from '../TypographyControls'

export default function AccountBenefitsLayout ({
  header,
  onHeaderChange,
  headerTypography,
  onHeaderTypographyChange,
  benefitItems = [],
  onBenefitItemsChange
}) {
  const handleAddBenefit = () => {
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

      {/* DT-923 Sprint 9 - PBall: Benefit items list editor */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontWeight: '600', fontSize: '13px' }}>Benefit Items ({benefitItems.length})</label>
          <button
            type="button"
            onClick={handleAddBenefit}
            style={{ padding: '4px 10px', fontSize: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            + Add Benefit
          </button>
        </div>
        {benefitItems.map((item, idx) => (
          <div key={idx} style={{ background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px' }}>
            <input
              type="text"
              value={item.heading}
              onChange={(e) => handleHeadingChange(idx, e.target.value)}
              placeholder="Benefit heading"
              style={{ width: '100%', marginBottom: '6px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
            <textarea
              rows={2}
              value={item.description}
              onChange={(e) => handleDescriptionChange(idx, e.target.value)}
              placeholder="Benefit description"
              style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
