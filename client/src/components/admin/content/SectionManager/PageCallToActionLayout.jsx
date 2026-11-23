// DT-875 Sprint 9
// PBall
// Form fields component for the PAGE_CTA (PageCallToAction) layout in SectionManager

import React from 'react'
import TypographyControls from '../TypographyControls'

export default function PageCallToActionLayout ({
  header,
  onHeaderChange,
  headerTypography,
  onHeaderTypographyChange,
  text,
  onTextChange,
  textTypography,
  onTextTypographyChange,
  buttonText = '',
  onButtonTextChange,
  buttonLink = '',
  onButtonLinkChange,
  secondaryButtonText = '',
  onSecondaryButtonTextChange,
  secondaryButtonLink = '',
  onSecondaryButtonLinkChange
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* DT-875 Sprint 9 - PBall: Page CTA heading and description */}
      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Call-To-Action Title</label>
        <input
          type="text"
          value={header}
          onChange={(e) => onHeaderChange(e.target.value)}
          placeholder="e.g. Ready to Begin Care?"
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

      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Call-To-Action Description</label>
        <textarea
          rows={3}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Our compassionate intake team is standing by..."
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        {onTextTypographyChange && (
          <TypographyControls
            label="Description Typography & Alignment"
            value={textTypography}
            onChange={onTextTypographyChange}
          />
        )}
      </div>

      {/* DT-875 Sprint 9 - PBall: Primary and secondary action link labels and URLs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
            Primary Action Label
          </label>
          <input
            type="text"
            value={buttonText}
            onChange={(e) => onButtonTextChange(e.target.value)}
            placeholder="e.g. Schedule a Consultation"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        {onButtonLinkChange && (
          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
              Primary Action Link
            </label>
            <input
              type="text"
              value={buttonLink}
              onChange={(e) => onButtonLinkChange(e.target.value)}
              placeholder="/schedule"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
        )}
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
            Secondary / Home Action Label
          </label>
          <input
            type="text"
            value={secondaryButtonText}
            onChange={(e) => onSecondaryButtonTextChange(e.target.value)}
            placeholder="e.g. Back to Welcome"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        {onSecondaryButtonLinkChange && (
          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
              Secondary / Home Action Link
            </label>
            <input
              type="text"
              value={secondaryButtonLink}
              onChange={(e) => onSecondaryButtonLinkChange(e.target.value)}
              placeholder="/welcome"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
