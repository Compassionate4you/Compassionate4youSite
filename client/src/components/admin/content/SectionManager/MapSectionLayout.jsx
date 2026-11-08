// DT-875 DT-923 Sprint 9
// PBall
// Form fields component for the MAP_SECTION section layout in SectionManager

import React from 'react'
import TypographyControls from '../TypographyControls'

export default function MapSectionLayout ({
  header,
  onHeaderChange,
  headerTypography,
  onHeaderTypographyChange,
  hideHeading = false,
  onHideHeadingChange,
  mapAddress,
  onMapAddressChange,
  embedUrl,
  onEmbedUrlChange,
  directionsUrl,
  onDirectionsUrlChange,
  directionsText = '',
  onDirectionsTextChange
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* DT-923 Sprint 9 - PBall: Section title and typography controls */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <label style={{ fontWeight: '600', fontSize: '13px' }}>Title / Header</label>
          {onHideHeadingChange && (
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(hideHeading)}
                onChange={(e) => onHideHeadingChange(e.target.checked)}
                style={{ width: '15px', height: '15px', accentColor: '#0f172a', cursor: 'pointer' }}
              />
              Hide Heading on Page
            </label>
          )}
        </div>
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

      {/* DT-875 DT-923 Sprint 9 - PBall: Map address, embed URL, directions URL, and directions button label */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Office Address Text</label>
          <input
            type="text"
            value={mapAddress}
            onChange={(e) => onMapAddressChange(e.target.value)}
            placeholder="1501 N Broadway, Ste 350A/B, Walnut Creek, CA"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Google Maps Embed URL</label>
          <input
            type="text"
            value={embedUrl}
            onChange={(e) => onEmbedUrlChange(e.target.value)}
            placeholder="https://www.google.com/maps/embed?..."
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Directions URL</label>
            <input
              type="text"
              value={directionsUrl}
              onChange={(e) => onDirectionsUrlChange(e.target.value)}
              placeholder="https://www.google.com/maps/dir/?..."
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          {onDirectionsTextChange && (
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Directions Button Text</label>
              <input
                type="text"
                value={directionsText}
                onChange={(e) => onDirectionsTextChange(e.target.value)}
                placeholder="Get Directions"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
