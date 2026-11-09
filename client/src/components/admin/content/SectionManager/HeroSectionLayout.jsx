// DT-875 Sprint 9
// PBall
// Form fields component for the HERO_SECTION layout in SectionManager

import React from 'react'
import CustomSelect from '../CustomSelect'

const HERO_VARIANT_OPTIONS = [
  { value: 'split', label: 'Split (Text Panel + Photo)' },
  { value: 'background', label: 'Background (Full-Bleed Image)' },
  { value: 'welcome', label: 'Welcome Split (Welcome Proportions)' }
]

const CONTENT_POSITION_OPTIONS = [
  { value: 'left', label: 'Text on Left / Photo on Right' },
  { value: 'right', label: 'Text on Right / Photo on Left' }
]

const TONE_OPTIONS = [
  { value: 'teal', label: 'Teal / Gray Surface (Home Health)' },
  { value: 'forest', label: 'Forest / Sage Surface (Hospice)' }
]

const HERO_ICON_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'House', label: 'House (Home Health Badge)' },
  { value: 'Heart', label: 'Heart (Hospice Badge)' }
]

export default function HeroSectionLayout ({
  header,
  onHeaderChange,
  text,
  onTextChange,
  heroVariant = 'split',
  onHeroVariantChange,
  contentPosition = 'left',
  onContentPositionChange,
  heroTone = 'teal',
  onHeroToneChange,
  icon = '',
  onIconChange,
  imageUrl,
  onImageUrlChange,
  imageAlt,
  onImageAltChange,
  buttonText,
  onButtonTextChange,
  buttonLink,
  onButtonLinkChange,
  showOverlay = false,
  onShowOverlayChange,
  showLanguageSelector = false,
  onShowLanguageSelectorChange
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* DT-875 Sprint 9 - PBall: Hero title and description fields */}
      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Hero Title</label>
        <input
          type="text"
          value={header}
          onChange={(e) => onHeaderChange(e.target.value)}
          placeholder="e.g. Home Health Care Services"
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Hero Description / Subtitle</label>
        <textarea
          rows={3}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Enter hero subtitle or introductory text..."
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
      </div>

      {/* DT-875 Sprint 9 - PBall: Hero layout variant, content position, tone, and heading badge icon */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Hero Variant</label>
          <CustomSelect
            value={heroVariant}
            onChange={onHeroVariantChange}
            options={HERO_VARIANT_OPTIONS}
            ariaLabel="Select Hero Variant"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Content Position</label>
          <CustomSelect
            value={contentPosition}
            onChange={onContentPositionChange}
            options={CONTENT_POSITION_OPTIONS}
            ariaLabel="Select Hero Content Position"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Surface Tone</label>
          <CustomSelect
            value={heroTone}
            onChange={onHeroToneChange}
            options={TONE_OPTIONS}
            ariaLabel="Select Hero Surface Tone"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Heading Badge Icon</label>
          <CustomSelect
            value={icon}
            onChange={onIconChange}
            options={HERO_ICON_OPTIONS}
            ariaLabel="Select Hero Badge Icon"
          />
        </div>
      </div>

      {/* DT-875 Sprint 9 - PBall: Hero image and CTA button fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Hero Image URL</label>
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
            placeholder="Descriptive hero image text"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>CTA Button Text (Optional)</label>
          <input
            type="text"
            value={buttonText}
            onChange={(e) => onButtonTextChange(e.target.value)}
            placeholder="e.g. Schedule Consultation"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>CTA Button Link</label>
          <input
            type="text"
            value={buttonLink}
            onChange={(e) => onButtonLinkChange(e.target.value)}
            placeholder="/schedule"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
      </div>

      {/* DT-875 Sprint 9 - PBall: Overlay and language selector toggles */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', paddingTop: '4px' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={Boolean(showOverlay)}
            onChange={(e) => onShowOverlayChange(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#0f172a', cursor: 'pointer' }}
          />
          Show Image Overlay Tint
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={Boolean(showLanguageSelector)}
            onChange={(e) => onShowLanguageSelectorChange(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#0f172a', cursor: 'pointer' }}
          />
          Show Language Selector Dropdown
        </label>
      </div>
    </div>
  )
}
