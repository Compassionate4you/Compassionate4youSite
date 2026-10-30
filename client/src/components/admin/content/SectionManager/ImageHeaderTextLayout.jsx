// DT-923 Sprint 9
// PBall
// Form fields component for the IMAGE_HEADER_TEXT section layout in SectionManager

import React from 'react'
import TypographyControls from '../TypographyControls'
import layoutImageLeft from '../../../../assets/images/layout-image-left.svg'
import layoutImageRight from '../../../../assets/images/layout-image-right.svg'

export default function ImageHeaderTextLayout ({
  header,
  onHeaderChange,
  headerTypography,
  onHeaderTypographyChange,
  text,
  onTextChange,
  textTypography,
  onTextTypographyChange,
  imagePosition,
  onImagePositionChange,
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

      {/* DT-923 Sprint 9 - PBall: Image Left/Right Toggle with SVGs */}
      <div style={{ marginTop: '6px', marginBottom: '10px' }}>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>
          Image Layout Position (Switch Left or Right)
        </label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => onImagePositionChange('left')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: imagePosition === 'left' ? '2px solid #0f172a' : '1px solid #cbd5e1',
              background: imagePosition === 'left' ? '#f1f5f9' : '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <img src={layoutImageLeft} alt="Image on Left" style={{ width: '100%', maxWidth: '140px', height: 'auto', borderRadius: '4px' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: imagePosition === 'left' ? '#0f172a' : '#64748b' }}>
              Image on Left
            </span>
          </button>
          <button
            type="button"
            onClick={() => onImagePositionChange('right')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: imagePosition === 'right' ? '2px solid #0f172a' : '1px solid #cbd5e1',
              background: imagePosition === 'right' ? '#f1f5f9' : '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <img src={layoutImageRight} alt="Image on Right" style={{ width: '100%', maxWidth: '140px', height: 'auto', borderRadius: '4px' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: imagePosition === 'right' ? '#0f172a' : '#64748b' }}>
              Image on Right
            </span>
          </button>
        </div>
      </div>

      {/* DT-923 Sprint 9 - PBall: Image and CTA button inputs */}
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
