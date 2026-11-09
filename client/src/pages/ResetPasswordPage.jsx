// DT-781 Sprint 8
// Gandhar Tare
// Page the reset email links to. Checks the link, shows whose account it is,
// and sets the new password. On success it sends the user to the login page
// so they can try the new password straight away.

import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiResetPassword, apiVerifyResetToken } from '../services/api'
import '../styles/forgotPassword.css'

// Same rules as the server (server/src/validators/authValidation.js).
export function meetsPasswordRules (password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  )
}

function ResetPasswordPage () {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  // 'checking' | 'invalid' | 'ready'
  const [status, setStatus] = useState(token ? 'checking' : 'invalid')
  const [account, setAccount] = useState(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorKey, setErrorKey] = useState(null)
  const [errorField, setErrorField] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!token) return undefined
    let cancelled = false

    apiVerifyResetToken(token)
      .then((data) => {
        if (cancelled) return
        setAccount(data.user)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('invalid')
      })

    return () => { cancelled = true }
  }, [token])

  const showError = (key, field) => {
    setErrorKey(key)
    setErrorField(field)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!password || !confirmPassword) {
      showError('login.resetPage.errors.required', !password ? 'password' : 'confirmPassword')
      return
    }
    if (!meetsPasswordRules(password)) {
      showError('login.resetPage.errors.weak', 'password')
      return
    }
    if (password !== confirmPassword) {
      showError('login.resetPage.errors.mismatch', 'confirmPassword')
      return
    }

    showError(null, null)
    setIsSubmitting(true)
    try {
      const data = await apiResetPassword(token, password)
      navigate('/login', {
        replace: true,
        state: { passwordUpdated: true, email: data.email || account?.email || '' }
      })
    } catch (err) {
      if (err.field === 'token') {
        setStatus('invalid')
      } else if (err.field === 'newPassword') {
        showError('login.resetPage.errors.weak', 'password')
      } else {
        showError('login.resetPage.errors.network', null)
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
          {status === 'checking' && (
            <p className='forgotpassword-desc' role='status'>{t('login.resetPage.checking')}</p>
          )}

          {status === 'invalid' && (
            <>
              <h2>{t('login.resetPage.invalidTitle')}</h2>
              <p className='forgotpassword-desc'>{t('login.resetPage.invalidText')}</p>
              <Link to='/forgot-password' className='forgotpassword-back-link'>
                {t('login.resetPage.requestNew')}
              </Link>
            </>
          )}

          {status === 'ready' && (
            <>
              <h2>{t('login.resetPage.title')}</h2>
              {/* DT-781: the user can see which account they are changing. */}
              <p className='forgotpassword-desc'>
                {t('login.resetPage.accountFor', { name: account?.name || account?.email })}
              </p>
              {account?.name && account?.email && (
                <p className='forgotpassword-desc forgotpassword-account-email'>{account.email}</p>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className={`forgotpassword-field${errorField === 'password' ? ' forgotpassword-field--error' : ''}`}>
                  <label htmlFor='reset-new-password'>{t('login.resetPage.newPassword')}</label>
                  <input
                    id='reset-new-password'
                    type='password'
                    autoComplete='new-password'
                    placeholder={t('login.resetPage.newPasswordPlaceholder')}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errorKey) showError(null, null)
                    }}
                    aria-invalid={errorField === 'password' ? 'true' : 'false'}
                    aria-describedby='reset-password-hint'
                  />
                  <p id='reset-password-hint' className='forgotpassword-hint'>{t('signup.passwordHint')}</p>
                </div>

                <div className={`forgotpassword-field${errorField === 'confirmPassword' ? ' forgotpassword-field--error' : ''}`}>
                  <label htmlFor='reset-confirm-password'>{t('login.resetPage.confirmPassword')}</label>
                  <input
                    id='reset-confirm-password'
                    type='password'
                    autoComplete='new-password'
                    placeholder={t('login.resetPage.confirmPasswordPlaceholder')}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (errorKey) showError(null, null)
                    }}
                    aria-invalid={errorField === 'confirmPassword' ? 'true' : 'false'}
                  />
                </div>

                {errorKey && (
                  <div className='forgotpassword-form-error' role='alert'>
                    {t(errorKey)}
                  </div>
                )}

                <div className='forgotpassword-login-actions'>
                  <button type='submit' className='forgotpassword-btn-primary' disabled={isSubmitting}>
                    {isSubmitting ? t('login.resetPage.submitting') : t('login.resetPage.submit')}
                  </button>
                  <Link to='/login' className='forgotpassword-login-forgot-link'>
                    {t('login.reset.backToLogin')}
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
