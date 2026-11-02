// DT-923 Sprint 9
// PBall
// Form fields component for the HEADER_TEXT section layout in SectionManager

import React from 'react'
import TypographyControls from '../TypographyControls'

export default function HeaderTextLayout ({
  header,
  onHeaderChange,
  headerTypography,
  onHeaderTypographyChange,
  text,
  onTextChange,
  textTypography,
  onTextTypographyChange
}) {
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

      {/* DT-923 Sprint 9 - PBall: Body text and typography controls */}
      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Body Text / Description</label>
        <textarea
          rows={4}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Enter section description..."
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <TypographyControls
          label="Body Text Typography & Alignment"
          value={textTypography}
          onChange={onTextTypographyChange}
        />
      </div>
    </div>
  )
}
