// Forgot password page (DT-341).
// DT-765: sends the request to the backend. Accepts an email or a phone
// number; the reset link always goes to the email on the account. When more
// than one account shares the phone number, the user is asked for their email.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiForgotPassword } from '../services/api'
import '../styles/forgotPassword.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_DIGITS_RE = /^[+]?\d{7,15}$/

function looksLikeEmail (value) {
  return EMAIL_RE.test(value)
}

function looksLikePhone (value) {
  const digits = value.replace(/[\s().-]/g, '')
  return PHONE_DIGITS_RE.test(digits)
}

function ForgotPasswordPage () {
  const { t } = useTranslation()

  const [identifier, setIdentifier] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  // DT-765: true once the server says the phone number matches several accounts.
  const [needsEmail, setNeedsEmail] = useState(false)
  const [errorKey, setErrorKey] = useState(null)
  const [errorField, setErrorField] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const showError = (key, field) => {
    setErrorKey(key)
    setErrorField(field)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    const value = identifier.trim()
    const email = confirmEmail.trim()

    if (!value) {
      showError('login.reset.errors.required', 'identifier')
      return
    }

    if (!looksLikeEmail(value) && !looksLikePhone(value)) {
      showError('login.reset.errors.invalid', 'identifier')
      return
    }

    if (needsEmail) {
      if (!email) {
        showError('login.reset.errors.confirmEmailRequired', 'confirmEmail')
        return
      }
      if (!looksLikeEmail(email)) {
        showError('login.reset.errors.confirmEmailInvalid', 'confirmEmail')
        return
      }
    }

    showError(null, null)
    setIsSubmitting(true)
    try {
      await apiForgotPassword(value, needsEmail ? email : undefined)
      setSubmitted(true)
    } catch (err) {
      if (err.status === 409 && err.field === 'confirmEmail') {
        setNeedsEmail(true)
      } else if (err.field === 'confirmEmail') {
        showError('login.reset.errors.confirmEmailInvalid', 'confirmEmail')
      } else if (err.field === 'identifier') {
        showError('login.reset.errors.invalid', 'identifier')
      } else {
        showError('login.reset.errors.network', null)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className='forgotpassword-navbar'>
        <div className='forgotpassword-navbar-title'>{t('portal.title')}</div>
      </div>

      <div className='forgotpassword-content'>
        <div className='forgotpassword-section-box'>
          <h2>{t('login.reset.title')}</h2>
          <p className='forgotpassword-desc'>{t('login.reset.subtitle')}</p>

          {submitted
            ? (
              <>
                <div className='forgotpassword-form-success' role='status'>
                  {t('login.reset.confirmation')}
                </div>
                <Link to='/login' className='forgotpassword-back-link'>
                  {t('login.reset.backToLogin')}
                </Link>
              </>
              )
            : (
              <form onSubmit={handleSubmit} noValidate>
                <div
                  className={`forgotpassword-field${
                                    errorField === 'identifier' ? ' forgotpassword-field--error' : ''
                                }`}
                >
                  <label htmlFor='reset-identifier'>
                    {t('login.reset.emailOrPhone')}
                  </label>
                  <input
                    id='reset-identifier'
                    type='text'
                    autoComplete='username'
                    placeholder={t(
                      'login.reset.emailOrPhonePlaceholder'
                    )}
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value)
                      // A different number may not be shared, so ask again.
                      if (needsEmail) setNeedsEmail(false)
                      if (errorKey) showError(null, null)
                    }}
                    aria-invalid={errorField === 'identifier' ? 'true' : 'false'}
                  />
                </div>

                {needsEmail && (
                  <>
                    <p className='forgotpassword-desc' role='status'>
                      {t('login.reset.confirmEmailPrompt')}
                    </p>
                    <div
                      className={`forgotpassword-field${
                        errorField === 'confirmEmail' ? ' forgotpassword-field--error' : ''
                      }`}
                    >
                      <label htmlFor='reset-confirm-email'>
                        {t('login.reset.confirmEmail')}
                      </label>
                      <input
                        id='reset-confirm-email'
                        type='email'
                        autoComplete='email'
                        placeholder={t('login.reset.confirmEmailPlaceholder')}
                        value={confirmEmail}
                        onChange={(e) => {
                          setConfirmEmail(e.target.value)
                          if (errorKey) showError(null, null)
                        }}
                        aria-invalid={errorField === 'confirmEmail' ? 'true' : 'false'}
                      />
                    </div>
                  </>
                )}

                {errorKey && (
                  <div className='forgotpassword-form-error' role='alert'>
                    {t(errorKey)}
                  </div>
                )}

                <div className='forgotpassword-login-actions'>
                  <button type='submit' className='forgotpassword-btn-primary' disabled={isSubmitting}>
                    {isSubmitting ? t('login.reset.sending') : t('login.reset.submit')}
                  </button>
                  <Link to='/login' className='forgotpassword-login-forgot-link'>
                    {t('login.reset.backToLogin')}
                  </Link>
                </div>
              </form>
              )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
