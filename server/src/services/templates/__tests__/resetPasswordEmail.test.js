// DT-771 Sprint 8
// Gandhar Tare
// Tests for the password reset email templates.

const {
  renderResetPasswordEmailHtml,
  renderResetPasswordEmailText
} = require('../resetPasswordEmail')
const { BRAND } = require('../contactEmail')

const sample = {
  name: 'Alice Smith',
  resetUrl: 'http://localhost:5173/reset-password?token=abc123',
  expiresInMinutes: 60
}

describe('renderResetPasswordEmailHtml', () => {
  test('greets the user by name and links to the reset page', () => {
    const html = renderResetPasswordEmailHtml(sample)

    expect(html).toContain('Hi Alice Smith,')
    expect(html).toContain('href="http://localhost:5173/reset-password?token=abc123"')
    expect(html).toContain('Reset my password')
  })

  test('states how long the link lasts', () => {
    expect(renderResetPasswordEmailHtml(sample)).toContain('expires in 60 minutes')
  })

  test('uses the same brand colours and fonts as the other site emails', () => {
    const html = renderResetPasswordEmailHtml(sample)

    expect(html).toContain(`background-color:${BRAND.green}`)
    expect(html).toContain(BRAND.headingFont)
    expect(html).toContain('Compassionate Home Health &amp; Hospice')
  })

  test('uses a table layout with inline styles for email client support', () => {
    const html = renderResetPasswordEmailHtml(sample)

    expect(html).toContain('role="presentation"')
    expect(html).not.toMatch(/<style[\s>]/)
    expect(html).not.toMatch(/<link[^>]+stylesheet/)
  })

  test('escapes a name containing HTML', () => {
    const html = renderResetPasswordEmailHtml({ ...sample, name: '<script>alert(1)</script>' })

    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  test('falls back to a neutral greeting when the account has no name', () => {
    expect(renderResetPasswordEmailHtml({ ...sample, name: null })).toContain('Hi there,')
  })
})

describe('renderResetPasswordEmailText', () => {
  test('includes the link, the expiry, and the greeting', () => {
    const text = renderResetPasswordEmailText(sample)

    expect(text).toContain('Hi Alice Smith,')
    expect(text).toContain(sample.resetUrl)
    expect(text).toContain('expires in 60 minutes')
  })
})
