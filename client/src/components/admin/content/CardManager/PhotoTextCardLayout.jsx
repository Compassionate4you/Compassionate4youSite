// DT-875 Sprint 9
// PBall
// Form fields component for the PHOTO_TEXT_CARD layout in CardManager

import React from 'react'
import CustomSelect from '../CustomSelect'
import layoutImageLeft from '../../../../assets/images/layout-image-left.svg'
import layoutImageRight from '../../../../assets/images/layout-image-right.svg'

const IMAGE_POSITION_OPTIONS = [
  { value: 'left', label: 'Photo on Left' },
  { value: 'right', label: 'Photo on Right' }
]

export default function PhotoTextCardLayout ({
  header,
  onHeaderChange,
  paragraph,
  onParagraphChange,
  imageUrl,
  onImageUrlChange,
  imageAlt,
  onImageAltChange,
  imagePosition = 'left',
  onImagePositionChange,
  imageUrlPlaceholder = '/images/working_a_puzzle_together.jpeg'
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* DT-875 Sprint 9 - PBall: Card heading input for PHOTO_TEXT_CARD */}
      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Card Header</label>
        <input
          type="text"
          value={header}
          onChange={(e) => onHeaderChange(e.target.value)}
          placeholder="e.g. Medicare Home Health Criteria"
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
      </div>

      {/* DT-875 Sprint 9 - PBall: Paragraph body supporting multi-paragraph and bullet lists */}
      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
          Paragraph Body (Separate paragraphs with blank lines; lines starting with &quot;- &quot; render as bullets)
        </label>
        <textarea
          rows={4}
          value={paragraph}
          onChange={(e) => onParagraphChange(e.target.value)}
          placeholder="Enter bordered photo card body text..."
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
      </div>

      {/* DT-875 Sprint 9 - PBall: Visual left/right photo placement toggle */}
      <div style={{ marginTop: '4px' }}>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>
          Photo Placement (Left or Right)
        </label>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
          <button
            type="button"
            onClick={() => onImagePositionChange('left')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: imagePosition === 'left' ? '2px solid #0f172a' : '1px solid #cbd5e1',
              background: imagePosition === 'left' ? '#f1f5f9' : '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <img src={layoutImageLeft} alt="Photo on Left" style={{ width: '100%', maxWidth: '120px', height: 'auto', borderRadius: '4px' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: imagePosition === 'left' ? '#0f172a' : '#64748b' }}>
              Photo on Left
            </span>
          </button>
          <button
            type="button"
            onClick={() => onImagePositionChange('right')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: imagePosition === 'right' ? '2px solid #0f172a' : '1px solid #cbd5e1',
              background: imagePosition === 'right' ? '#f1f5f9' : '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <img src={layoutImageRight} alt="Photo on Right" style={{ width: '100%', maxWidth: '120px', height: 'auto', borderRadius: '4px' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: imagePosition === 'right' ? '#0f172a' : '#64748b' }}>
              Photo on Right
            </span>
          </button>
        </div>
      </div>

      {/* DT-875 Sprint 9 - PBall: Photo URL, alt text, and position select */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Photo URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder={imageUrlPlaceholder}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Photo Alt Text</label>
          <input
            type="text"
            value={imageAlt}
            onChange={(e) => onImageAltChange(e.target.value)}
            placeholder="Descriptive photo alt text"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Photo Alignment</label>
          <CustomSelect
            value={imagePosition}
            onChange={onImagePositionChange}
            options={IMAGE_POSITION_OPTIONS}
            ariaLabel="Select Photo Alignment"
          />
        </div>
      </div>
    </div>
  )
}
