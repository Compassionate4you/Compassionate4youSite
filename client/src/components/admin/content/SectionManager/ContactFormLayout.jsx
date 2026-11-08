// DT-875 DT-923 Sprint 9
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
  onAddressLine1Change,
  addressLine2 = '',
  onAddressLine2Change
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

      {/* DT-875 DT-923 Sprint 9 - PBall: Complete contact details grid fields including Address Line 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="(925) 954-4441"
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="info@compassionate4you.com"
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Fax Number</label>
          <input
            type="text"
            value={fax}
            onChange={(e) => onFaxChange(e.target.value)}
            placeholder="(925) 954-4442"
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Address Line 1</label>
          <input
            type="text"
            value={addressLine1}
            onChange={(e) => onAddressLine1Change(e.target.value)}
            placeholder="1501 N Broadway, Ste 350A/B"
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        {onAddressLine2Change && (
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Address Line 2 (City, State, ZIP)</label>
            <input
              type="text"
              value={addressLine2}
              onChange={(e) => onAddressLine2Change(e.target.value)}
              placeholder="Walnut Creek, CA 94596"
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
