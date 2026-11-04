// DT-622 Sprint 8
// Preston Ball
// Modular contact section component rendering contact details and interactive contact form

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiSubmitContactForm } from '../../../services/api'
import '../../../styles/components/modular/sections/ContactFormSection.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MESSAGE_MIN = 10
const EMPTY_FORM = { name: '', email: '', message: '' }

export default function ContactFormSection ({
  config,
  content = {},
  style = {}
}) {
  const { t } = useTranslation()
  const data = content || config?.content || {}

  const title = data.title || data.header || config?.title || t('landing.contactTitle')
  const phone = data.phone || t('landing.contactPhone')
  const email = data.email || t('landing.contactEmail')
  const fax = data.fax || t('landing.contactFax')
  const addressLine1 = data.addressLine1 || t('landing.contactAddressLine1')
  const addressLine2 = data.addressLine2 || t('landing.contactAddressLine2')

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
    setStatus(null)
  }

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
      const res = await apiSubmitContactForm({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim()
      })
      setForm(EMPTY_FORM)
      setErrors({})
      setStatus('success')
      setStatusMessage(res?.message || t('landing.contactFormSuccess'))
    } catch (err) {
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
    <section className="modular-contact-section" id="contact" style={style}>
      <div className="modular-contact-section__inner">
        {title && (
          <h2 className="modular-contact-section__title">
            {title}
          </h2>
        )}
        <div className="modular-contact-container">
          <div className="modular-contact-info">
            {phone && (
              <div className="modular-contact-item">
                <div className="modular-contact-icon" aria-hidden="true">📞</div>
                <div>
                  <h3>{t('landing.contactPhoneLabel')}</h3>
                  <p>{phone}</p>
                </div>
              </div>
            )}
            {email && (
              <div className="modular-contact-item">
                <div className="modular-contact-icon" aria-hidden="true">✉️</div>
                <div>
                  <h3>{t('landing.contactEmailLabel')}</h3>
                  <p>{email}</p>
                </div>
              </div>
            )}
            {fax && (
              <div className="modular-contact-item">
                <div className="modular-contact-icon" aria-hidden="true">📠</div>
                <div>
                  <h3>{t('landing.contactFaxLabel')}</h3>
                  <p>{fax}</p>
                </div>
              </div>
            )}
            {addressLine1 && (
              <div className="modular-contact-item">
                <div className="modular-contact-icon" aria-hidden="true">📍</div>
                <div>
                  <h3>{t('landing.contactAddressLabel')}</h3>
                  <p>{addressLine1}</p>
                  {addressLine2 && <p>{addressLine2}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="modular-contact-form-col">
            <div className="contact-form-card">
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <p className="contact-form__required-note">
                  {t('landing.contactFormRequiredNote')}
                </p>

                <label htmlFor="name">
                  {t('landing.contactFormName')}
                  <span className="contact-form__required" aria-hidden="true"> *</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={updateField}
                  placeholder={t('landing.contactFormNamePlaceholder')}
                  aria-required="true"
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className={errors.name ? 'contact-form__input--error' : undefined}
                />
                {errors.name && (
                  <span className="contact-form__error" id="name-error" role="alert">
                    {errors.name}
                  </span>
                )}

                <label htmlFor="email">
                  {t('landing.contactFormEmail')}
                  <span className="contact-form__required" aria-hidden="true"> *</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  placeholder={t('landing.contactFormEmailPlaceholder')}
                  aria-required="true"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={errors.email ? 'contact-form__input--error' : undefined}
                />
                {errors.email && (
                  <span className="contact-form__error" id="email-error" role="alert">
                    {errors.email}
                  </span>
                )}

                <label htmlFor="message">
                  {t('landing.contactFormMessage')}
                  <span className="contact-form__required" aria-hidden="true"> *</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={form.message}
                  onChange={updateField}
                  placeholder={t('landing.contactFormMessagePlaceholder')}
                  aria-required="true"
                  aria-invalid={errors.message ? 'true' : 'false'}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                  className={errors.message ? 'contact-form__input--error' : undefined}
                />
                {errors.message && (
                  <span className="contact-form__error" id="message-error" role="alert">
                    {errors.message}
                  </span>
                )}

                {status && (
                  <div
                    className={`contact-form__status contact-form__status--${status}`}
                    role="status"
                  >
                    {statusMessage}
                  </div>
                )}

                <button type="submit" className="contact-btn" disabled={isSubmitting}>
                  {isSubmitting
                    ? t('landing.contactFormSending')
                    : t('landing.contactFormButton')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
