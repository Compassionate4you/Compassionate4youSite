// DT-629 / DT-630: HTML template for contact form submissions.
//
// Colours and fonts mirror client/src/styles/global.css so the email matches
// the site. Email clients ignore external stylesheets and most <style> rules,
// so everything here is inline styles on table layout - the only approach
// that renders consistently in Outlook, Gmail and Apple Mail.

// Pulled from global.css.
const BRAND = {
  green: '#366454',
  greenDark: '#294f42',
  lightGreen: '#DBE4C3',
  sage: '#9DA191',
  pageBackground: '#f0f2ee',
  charcoal: '#262626',
  mutedText: '#6b7280',
  divider: '#e5e7eb',
  white: '#ffffff',
  headingFont: "'Crimson Text', Georgia, 'Times New Roman', serif",
  bodyFont: 'Arial, Helvetica, sans-serif'
}

// Escapes user input so a message containing HTML cannot alter the email.
function escapeHtml (value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Keeps the reader's paragraph breaks without allowing markup through.
function formatMessageBody (message) {
  return escapeHtml(message)
    .split(/\n{2,}/)
    .map((para) => para.replace(/\n/g, '<br />'))
    .map(
      (para) =>
        `<p style="margin:0 0 14px;font-family:${BRAND.bodyFont};font-size:15px;line-height:1.6;color:${BRAND.charcoal};">${para}</p>`
    )
    .join('')
}

function detailRow (label, value, { isLast = false } = {}) {
  const border = isLast ? '' : `border-bottom:1px solid ${BRAND.divider};`
  return `
    <tr>
      <td style="padding:12px 0;${border}font-family:${BRAND.bodyFont};font-size:13px;font-weight:bold;color:${BRAND.mutedText};text-transform:uppercase;letter-spacing:0.4px;width:90px;vertical-align:top;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:12px 0;${border}font-family:${BRAND.bodyFont};font-size:15px;color:${BRAND.charcoal};vertical-align:top;">
        ${value}
      </td>
    </tr>`
}

function renderContactEmailHtml ({ name, email, message, submittedAt }) {
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const timestamp = (submittedAt ? new Date(submittedAt) : new Date()).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Los_Angeles'
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>New contact form submission</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.pageBackground};">
  <!-- Preview text shown in the inbox list before opening. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    New message from ${safeName} via the Compassionate4You contact form.
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
                New contact form submission
              </p>
            </td>
          </tr>

          <!-- Sender details -->
          <tr>
            <td style="padding:28px 32px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${detailRow('From', safeName)}
                ${detailRow(
                  'Email',
                  `<a href="mailto:${safeEmail}" style="color:${BRAND.green};text-decoration:underline;">${safeEmail}</a>`
                )}
                ${detailRow('Received', escapeHtml(timestamp), { isLast: true })}
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding:8px 32px 4px;">
              <p style="margin:0 0 10px;font-family:${BRAND.bodyFont};font-size:13px;font-weight:bold;color:${BRAND.mutedText};text-transform:uppercase;letter-spacing:0.4px;">
                Message
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.pageBackground};border-left:4px solid ${BRAND.sage};border-radius:6px;">
                <tr>
                  <td style="padding:16px 18px;">
                    ${formatMessageBody(message)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reply button -->
          <tr>
            <td style="padding:24px 32px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${BRAND.green};border-radius:6px;">
                    <a href="mailto:${safeEmail}?subject=Re:%20Your%20message%20to%20Compassionate%20Home%20Health%20%26%20Hospice"
                       style="display:inline-block;padding:12px 26px;font-family:${BRAND.bodyFont};font-size:15px;font-weight:bold;color:${BRAND.white};text-decoration:none;">
                      Reply to ${safeName}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${BRAND.pageBackground};padding:18px 32px;border-top:1px solid ${BRAND.divider};">
              <p style="margin:0;font-family:${BRAND.bodyFont};font-size:12px;line-height:1.5;color:${BRAND.mutedText};">
                Sent automatically from the contact form at compassionate4you.com.
                Reply directly to this email to respond to ${safeName}.
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
function renderContactEmailText ({ name, email, message, submittedAt }) {
  const timestamp = (submittedAt ? new Date(submittedAt) : new Date()).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Los_Angeles'
  })

  return [
    'NEW CONTACT FORM SUBMISSION',
    'Compassionate Home Health & Hospice',
    '',
    `From:     ${name}`,
    `Email:    ${email}`,
    `Received: ${timestamp}`,
    '',
    'MESSAGE',
    '-------',
    message,
    '',
    '---',
    'Sent automatically from the contact form at compassionate4you.com.',
    `Reply to this email to respond to ${name}.`
  ].join('\n')
}

module.exports = {
  renderContactEmailHtml,
  renderContactEmailText,
  escapeHtml,
  BRAND
}
