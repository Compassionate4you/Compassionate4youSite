// DT-923 Sprint 9
// PBall
// Form fields component for the HEADER_PARAGRAPH card layout in CardManager

import React from 'react'
import CustomSelect from '../CustomSelect'
import TypographyControls from '../TypographyControls'

export default function HeaderParagraphLayout ({
  header,
  onHeaderChange,
  headerTypography,
  onHeaderTypographyChange,
  paragraph,
  onParagraphChange,
  paragraphTypography,
  onParagraphTypographyChange,
  alignment,
  onAlignmentChange,
  alignmentOptions,
  alignmentLabel = 'Text Alignment',
  alignmentAriaLabel = 'Select Card Alignment'
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* DT-923 Sprint 9 - PBall: Card header and typography controls for HEADER_PARAGRAPH layout */}
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

      {/* DT-923 Sprint 9 - PBall: Paragraph body and typography controls */}
      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
          Paragraph Body (Lines starting with &quot;- &quot; render as bullet items)
        </label>
        <textarea
          rows={4}
          value={paragraph}
          onChange={(e) => onParagraphChange(e.target.value)}
          placeholder="Enter card description..."
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <TypographyControls
          label="Paragraph Body Typography"
          value={paragraphTypography}
          onChange={onParagraphTypographyChange}
        />
      </div>

      {/* DT-923 Sprint 9 - PBall: Card alignment selector */}
      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{alignmentLabel}</label>
        <CustomSelect
          value={alignment}
          onChange={onAlignmentChange}
          options={alignmentOptions}
          style={{ width: '180px' }}
          ariaLabel={alignmentAriaLabel}
        />
      </div>
    </div>
  )
}
