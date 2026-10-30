// DT-923 Sprint 9
// PBall
// Form fields component for the HEADER_SYMBOL card layout in CardManager

import React from 'react'
import CustomSelect from '../CustomSelect'
import TypographyControls from '../TypographyControls'

export default function HeaderSymbolLayout ({
  header,
  onHeaderChange,
  headerTypography,
  onHeaderTypographyChange,
  symbol,
  onSymbolChange,
  symbolOptions,
  alignment,
  onAlignmentChange,
  alignmentOptions,
  symbolLabel = 'Symbol Icon',
  symbolAriaLabel = 'Select Icon Symbol',
  alignmentLabel = 'Alignment',
  alignmentAriaLabel = 'Select Icon Alignment'
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* DT-923 Sprint 9 - PBall: Card header and typography controls for HEADER_SYMBOL layout */}
      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Card Header</label>
        <input
          type="text"
          value={header}
          onChange={(e) => onHeaderChange(e.target.value)}
          placeholder="Card title"
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <TypographyControls
          label="Card Header Typography"
          value={headerTypography}
          onChange={onHeaderTypographyChange}
        />
      </div>

      {/* DT-923 Sprint 9 - PBall: Symbol icon and alignment selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{symbolLabel}</label>
          <CustomSelect
            value={symbol}
            onChange={onSymbolChange}
            options={symbolOptions}
            ariaLabel={symbolAriaLabel}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{alignmentLabel}</label>
          <CustomSelect
            value={alignment}
            onChange={onAlignmentChange}
            options={alignmentOptions}
            ariaLabel={alignmentAriaLabel}
          />
        </div>
      </div>
    </div>
  )
}
