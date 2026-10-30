// DT-923 Sprint 9
// PBall
// Form fields component for the IMAGE_FULL_WIDTH card layout in CardManager

import React from 'react'
import CustomSelect from '../CustomSelect'
import TypographyControls from '../TypographyControls'

const IMAGE_ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Image on Left' },
  { value: 'right', label: 'Image on Right' }
]

export default function ImageFullWidthLayout ({
  header,
  onHeaderChange,
  headerTypography,
  onHeaderTypographyChange,
  paragraph,
  onParagraphChange,
  paragraphTypography,
  onParagraphTypographyChange,
  imageUrl,
  onImageUrlChange,
  imageAlt,
  onImageAltChange,
  alignment,
  onAlignmentChange,
  imageUrlPlaceholder = '/assets/images/CareImage1.jpeg'
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* DT-923 Sprint 9 - PBall: Card header and typography controls for IMAGE_FULL_WIDTH layout */}
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

      {/* DT-923 Sprint 9 - PBall: Image URL, alt text, and split alignment controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder={imageUrlPlaceholder}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Image Alt</label>
          <input
            type="text"
            value={imageAlt}
            onChange={(e) => onImageAltChange(e.target.value)}
            placeholder="Image description"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Image Alignment</label>
          <CustomSelect
            value={alignment}
            onChange={onAlignmentChange}
            options={IMAGE_ALIGNMENT_OPTIONS}
            ariaLabel="Image Alignment"
          />
        </div>
      </div>
    </div>
  )
}
