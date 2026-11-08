// DT-875 DT-923 Sprint 9
// PBall
// Form fields component for the HEADER_TEXT (BannerSection) layout in SectionManager

import React from 'react'
import CustomSelect from '../CustomSelect'
import TypographyControls from '../TypographyControls'

const BANNER_ICON_OPTIONS = [
  { value: '', label: 'Auto (By Section ID / Heart Default)' },
  { value: 'Heart', label: 'Heart (Philosophy / General)' },
  { value: 'HeartHandshake', label: 'HeartHandshake (Caring)' },
  { value: 'Users', label: 'Users (About / Community)' }
]

export default function HeaderTextLayout ({
  header,
  onHeaderChange,
  headerTypography,
  onHeaderTypographyChange,
  text,
  onTextChange,
  textTypography,
  onTextTypographyChange,
  icon = '',
  onIconChange,
  formatBody = false,
  onFormatBodyChange
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

      {/* DT-875 Sprint 9 - PBall: Decorative banner ornament icon and body list formatting controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'end' }}>
        {onIconChange && (
          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Banner Badge Icon</label>
            <CustomSelect
              value={icon}
              onChange={onIconChange}
              options={BANNER_ICON_OPTIONS}
              ariaLabel="Select Banner Badge Icon"
            />
          </div>
        )}
        {onFormatBodyChange && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', padding: '10px 0', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={Boolean(formatBody)}
              onChange={(e) => onFormatBodyChange(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#0f172a', cursor: 'pointer' }}
            />
            Format multi-paragraphs &amp; &quot;- &quot; bullet lists
          </label>
        )}
      </div>
    </div>
  )
}
