// DT-567 / DT-568 / DT-569: contact form on the landing page.
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiSubmitContactForm } from '../services/api'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MESSAGE_MIN = 10

const EMPTY_FORM = { name: '', email: '', message: '' }

function ContactForm () {
  const { t } = useTranslation()

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null) // 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    // Clear this field's error as soon as the person starts fixing it.
    setErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
    setStatus(null)
  }

  // DT-568: all three fields are required, checked before anything is sent.
  const validate = () => {
    const found = {}

    if (!form.name.trim()) {
      found.name = t('landing.contactFormErrors.nameRequired')
    }

    if (!form.email.trim()) {
      found.email = t('landing.contactFormErrors.emailRequired')
    } else if (!EMAIL_RE.test(form.email.trim())) {
      found.email = t('landing.contactFormErrors.emailInvalid')
    }

    if (!form.message.trim()) {
      found.message = t('landing.contactFormErrors.messageRequired')
    } else if (form.message.trim().length < MESSAGE_MIN) {
      found.message = t('landing.contactFormErrors.messageTooShort')
    }

    return found
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const found = validate()
    if (Object.keys(found).length > 0) {
      setErrors(found)
      setStatus(null)
      return
    }

    setIsSubmitting(true)
    setStatus(null)
    try {
      const data = await apiSubmitContactForm({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim()
      })
      setForm(EMPTY_FORM)
      setErrors({})
      setStatus('success')
      setStatusMessage(data?.message || t('landing.contactFormSuccess'))
    } catch (err) {
      // The server names the offending field when it knows it.
      if (err.field) {
        setErrors({ [err.field]: err.message })
      } else {
        setStatus('error')
        setStatusMessage(err.message || t('landing.contactFormError'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='contact-form-card'>
      <form className='contact-form' onSubmit={handleSubmit} noValidate>
        {/* DT-569: required fields are marked so expectations are clear. */}
        <p className='contact-form__required-note'>
          {t('landing.contactFormRequiredNote')}
        </p>

        <label htmlFor='name'>
          {t('landing.contactFormName')}
          <span className='contact-form__required' aria-hidden='true'> *</span>
        </label>
        <input
          id='name'
          name='name'
          type='text'
          value={form.name}
          onChange={updateField}
          placeholder={t('landing.contactFormNamePlaceholder')}
          aria-required='true'
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={errors.name ? 'contact-form__input--error' : undefined}
        />
        {errors.name && (
          <span className='contact-form__error' id='name-error' role='alert'>
            {errors.name}
          </span>
        )}

        <label htmlFor='email'>
          {t('landing.contactFormEmail')}
          <span className='contact-form__required' aria-hidden='true'> *</span>
        </label>
        <input
          id='email'
          name='email'
          type='email'
          value={form.email}
          onChange={updateField}
          placeholder={t('landing.contactFormEmailPlaceholder')}
          aria-required='true'
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={errors.email ? 'contact-form__input--error' : undefined}
        />
        {errors.email && (
          <span className='contact-form__error' id='email-error' role='alert'>
            {errors.email}
          </span>
        )}

        <label htmlFor='message'>
          {t('landing.contactFormMessage')}
          <span className='contact-form__required' aria-hidden='true'> *</span>
        </label>
        <textarea
          id='message'
          name='message'
          rows='6'
          value={form.message}
          onChange={updateField}
          placeholder={t('landing.contactFormMessagePlaceholder')}
          aria-required='true'
          aria-invalid={errors.message ? 'true' : 'false'}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className={errors.message ? 'contact-form__input--error' : undefined}
        />
        {errors.message && (
          <span className='contact-form__error' id='message-error' role='alert'>
            {errors.message}
          </span>
        )}

        {status && (
          <div
            className={`contact-form__status contact-form__status--${status}`}
            role='status'
          >
            {statusMessage}
          </div>
        )}

        <button type='submit' className='contact-btn' disabled={isSubmitting}>
          {isSubmitting
            ? t('landing.contactFormSending')
            : t('landing.contactFormButton')}
        </button>
      </form>
    </div>
  )
}

export default ContactForm
