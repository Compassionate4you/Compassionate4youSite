// DT-923 Sprint 9
// PBall
// Form fields component for the FULLSCREEN_IMAGE_HEADER section layout in SectionManager

import React from 'react'
import TypographyControls from '../TypographyControls'

export default function FullscreenImageHeaderLayout ({
  header,
  onHeaderChange,
  headerTypography,
  onHeaderTypographyChange,
  text,
  onTextChange,
  textTypography,
  onTextTypographyChange,
  imageUrl,
  onImageUrlChange,
  imageAlt,
  onImageAltChange,
  buttonText,
  onButtonTextChange,
  buttonLink,
  onButtonLinkChange
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

      {/* DT-923 Sprint 9 - PBall: Fullscreen banner image and CTA button fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder="/assets/images/CareImage1.jpeg"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Image Alt Text</label>
          <input
            type="text"
            value={imageAlt}
            onChange={(e) => onImageAltChange(e.target.value)}
            placeholder="Descriptive image text"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Button Text</label>
          <input
            type="text"
            value={buttonText}
            onChange={(e) => onButtonTextChange(e.target.value)}
            placeholder="e.g. Schedule Consultation"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Button Link</label>
          <input
            type="text"
            value={buttonLink}
            onChange={(e) => onButtonLinkChange(e.target.value)}
            placeholder="/schedule"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
      </div>
    </div>
  )
}
