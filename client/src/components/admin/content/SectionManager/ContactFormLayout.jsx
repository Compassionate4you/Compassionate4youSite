// DT-923 Sprint 9
// PBall
// Form fields component for the CONTACT_FORM section layout in SectionManager

import React from 'react'
import TypographyControls from '../TypographyControls'

export default function ContactFormLayout ({
  header,
  onHeaderChange,
  headerTypography,
  onHeaderTypographyChange,
  phone,
  onPhoneChange,
  email,
  onEmailChange,
  fax,
  onFaxChange,
  addressLine1,
  onAddressLine1Change
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

      {/* DT-923 Sprint 9 - PBall: Contact details grid fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <input
          type="text"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="Phone"
          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Email"
          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <input
          type="text"
          value={fax}
          onChange={(e) => onFaxChange(e.target.value)}
          placeholder="Fax"
          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <input
          type="text"
          value={addressLine1}
          onChange={(e) => onAddressLine1Change(e.target.value)}
          placeholder="Address line 1"
          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
      </div>
    </div>
  )
}
