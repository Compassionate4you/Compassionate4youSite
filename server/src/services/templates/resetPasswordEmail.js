// DT-771 Sprint 8
// Gandhar Tare
// HTML and plain-text templates for the password reset email.
//
// Shares its colours, fonts and table layout with the contact form email
// (contactEmail.js) so every email the site sends looks the same.

const { BRAND, escapeHtml } = require('./contactEmail')

function renderResetPasswordEmailHtml ({ name, resetUrl, expiresInMinutes }) {
  const safeName = escapeHtml(name || 'there')
  const safeUrl = escapeHtml(resetUrl)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.pageBackground};">
  <!-- Preview text shown in the inbox list before opening. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Use this link to reset your Compassionate4You password. It expires in ${expiresInMinutes} minutes.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.pageBackground};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:${BRAND.white};border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND.green};padding:28px 32px;">
              <h1 style="margin:0;font-family:${BRAND.headingFont};font-size:26px;font-weight:600;color:${BRAND.white};">
                Compassionate Home Health &amp; Hospice
              </h1>
              <p style="margin:6px 0 0;font-family:${BRAND.bodyFont};font-size:14px;color:${BRAND.lightGreen};">
                Password reset request
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 32px 8px;">
              <p style="margin:0 0 14px;font-family:${BRAND.bodyFont};font-size:15px;line-height:1.6;color:${BRAND.charcoal};">
                Hi ${safeName},
              </p>
              <p style="margin:0 0 14px;font-family:${BRAND.bodyFont};font-size:15px;line-height:1.6;color:${BRAND.charcoal};">
                We received a request to reset the password for your account. Click the button below to choose a new password.
              </p>
            </td>
          </tr>

          <!-- Reset button -->
          <tr>
            <td style="padding:8px 32px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${BRAND.green};border-radius:6px;">
                    <a href="${safeUrl}"
                       style="display:inline-block;padding:12px 26px;font-family:${BRAND.bodyFont};font-size:15px;font-weight:bold;color:${BRAND.white};text-decoration:none;">
                      Reset my password
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Expiry and fallback link -->
          <tr>
            <td style="padding:20px 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.pageBackground};border-left:4px solid ${BRAND.sage};border-radius:6px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 10px;font-family:${BRAND.bodyFont};font-size:14px;line-height:1.6;color:${BRAND.charcoal};">
                      This link expires in ${expiresInMinutes} minutes and can only be used once.
                    </p>
                    <p style="margin:0;font-family:${BRAND.bodyFont};font-size:13px;line-height:1.6;color:${BRAND.mutedText};">
                      If the button does not work, copy this link into your browser:<br />
                      <a href="${safeUrl}" style="color:${BRAND.green};text-decoration:underline;word-break:break-all;">${safeUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${BRAND.pageBackground};padding:18px 32px;border-top:1px solid ${BRAND.divider};">
              <p style="margin:0;font-family:${BRAND.bodyFont};font-size:12px;line-height:1.5;color:${BRAND.mutedText};">
                If you did not ask to reset your password, you can ignore this email. Your password will not change.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// Plain-text alternative for clients that do not render HTML.
function renderResetPasswordEmailText ({ name, resetUrl, expiresInMinutes }) {
  return [
    `Hi ${name || 'there'},`,
    '',
    'We received a request to reset the password for your Compassionate Home Health & Hospice account.',
    '',
    'Choose a new password here:',
    resetUrl,
    '',
    `This link expires in ${expiresInMinutes} minutes and can only be used once.`,
    '',
    '---',
    'If you did not ask to reset your password, you can ignore this email. Your password will not change.'
  ].join('\n')
}

module.exports = {
  renderResetPasswordEmailHtml,
  renderResetPasswordEmailText
}
