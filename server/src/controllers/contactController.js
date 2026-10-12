// DT-567 / DT-570 / DT-623: contact form submissions.
const { sendValidationError } = require('../utils/errorResponse')
const { validateContactForm } = require('../validators/contactValidation')
const { sendEmail } = require('../services/notificationService')
const {
  renderContactEmailHtml,
  renderContactEmailText
} = require('../services/templates/contactEmail')

// Simple in-memory throttle: one IP cannot flood the inbox. Resets when the
// server restarts, which is fine for this purpose.
const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 5 }
const submissions = new Map()

function isRateLimited (ip) {
  const now = Date.now()
  const recent = (submissions.get(ip) || []).filter((t) => now - t < RATE_LIMIT.windowMs)

  if (recent.length >= RATE_LIMIT.max) {
    submissions.set(ip, recent)
    return true
  }

  recent.push(now)
  submissions.set(ip, recent)
  return false
}

// POST /api/contact
async function submitContactForm (req, res, next) {
  try {
    const { name, email, message } = req.body || {}

    const problem = validateContactForm({ name, email, message })
    if (problem) {
      return sendValidationError(res, problem.message, problem.field)
    }

    const ip = req.ip || req.socket?.remoteAddress || 'unknown'
    if (isRateLimited(ip)) {
      return res.status(429).json({
        success: false,
        error: {
          message: 'You have sent several messages already. Please try again later.',
          field: null
        }
      })
    }

    const submission = {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      submittedAt: new Date()
    }

    const recipient = process.env.CONTACT_FORM_RECIPIENT
    if (!recipient) {
      // eslint-disable-next-line no-console
      console.error('CONTACT_FORM_RECIPIENT is not set - cannot deliver contact form submissions.')
      return res.status(500).json({
        success: false,
        error: { message: 'We could not send your message. Please call our office.', field: null }
      })
    }

    const result = await sendEmail({
      to: recipient,
      subject: `New contact form message from ${submission.name}`,
      body: renderContactEmailText(submission),
      html: renderContactEmailHtml(submission),
      // Staff can hit reply and respond straight to the sender.
      replyTo: submission.email
    })

    if (!result.delivered && !result.skipped) {
      return res.status(502).json({
        success: false,
        error: { message: 'We could not send your message. Please call our office.', field: null }
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Thank you for reaching out. We will get back to you soon.'
    })
  } catch (err) {
    return next(err)
  }
}

module.exports = { submitContactForm }
