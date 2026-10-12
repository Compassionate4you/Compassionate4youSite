// DT-568: contact form input rules.
const { isValidEmail } = require('./authValidation')

const LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  message: { min: 10, max: 2000 }
}

// Cheap guard against a bot pasting links into the message box.
const MAX_LINKS = 3

function countLinks (text) {
  return (String(text).match(/https?:\/\//gi) || []).length
}

// Returns { field, message } for the first problem found, or null when valid.
function validateContactForm ({ name, email, message }) {
  if (typeof name !== 'string' || name.trim() === '') {
    return { field: 'name', message: 'Please enter your name.' }
  }
  const trimmedName = name.trim()
  if (trimmedName.length < LIMITS.name.min) {
    return { field: 'name', message: 'Please enter your full name.' }
  }
  if (trimmedName.length > LIMITS.name.max) {
    return { field: 'name', message: `Name must be under ${LIMITS.name.max} characters.` }
  }

  if (typeof email !== 'string' || email.trim() === '') {
    return { field: 'email', message: 'Please enter your email address.' }
  }
  if (email.trim().length > LIMITS.email.max || !isValidEmail(email)) {
    return { field: 'email', message: 'Please enter a valid email address.' }
  }

  if (typeof message !== 'string' || message.trim() === '') {
    return { field: 'message', message: 'Please enter a message.' }
  }
  const trimmedMessage = message.trim()
  if (trimmedMessage.length < LIMITS.message.min) {
    return { field: 'message', message: 'Please tell us a little more so we can help.' }
  }
  if (trimmedMessage.length > LIMITS.message.max) {
    return { field: 'message', message: `Message must be under ${LIMITS.message.max} characters.` }
  }
  if (countLinks(trimmedMessage) > MAX_LINKS) {
    return { field: 'message', message: 'Please remove some links from your message.' }
  }

  return null
}

module.exports = { validateContactForm, LIMITS }
