// DT-875 Sprint 9
// PBall
// Form fields component for the PAGE_CTA (PageCallToAction) layout in SectionManager

import React from 'react'

export default function PageCallToActionLayout ({
  header,
  onHeaderChange,
  text,
  onTextChange,
  buttonText = '',
  onButtonTextChange,
  secondaryButtonText = '',
  onSecondaryButtonTextChange
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
      </div>

      {/* DT-875 Sprint 9 - PBall: Primary (/schedule) and Home (/welcome) action link labels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
            Primary Action Label (Links to /schedule)
          </label>
          <input
            type="text"
            value={buttonText}
            onChange={(e) => onButtonTextChange(e.target.value)}
            placeholder="e.g. Schedule a Consultation"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
            Home Action Label (Links to /welcome)
          </label>
          <input
            type="text"
            value={secondaryButtonText}
            onChange={(e) => onSecondaryButtonTextChange(e.target.value)}
            placeholder="e.g. Back to Welcome"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
      </div>
    </div>
  )
}
