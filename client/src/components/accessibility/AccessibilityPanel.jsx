import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccessibility } from '../../context/AccessibilityContext'
import './styles/accessibility.css'

function AccessibilityPanel () {
  const { t, i18n } = useTranslation()
  const { textSize, theme, highContrast, setTextSize, setTheme, setHighContrast } = useAccessibility()
  const [isOpen, setIsOpen] = useState(false)
  const toggleRef = useRef(null)
  const closeRef = useRef(null)
  const panelRef = useRef(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (!isOpen) {
      if (wasOpen.current) toggleRef.current?.focus()
      wasOpen.current = false
      return undefined
    }

    wasOpen.current = true

    closeRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsOpen(false)
        return
      }

      // Keep keyboard focus inside the open accessibility dialog.
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll(
          'button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )

        if (!focusable.length) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  function handleLanguageChange (event) {
    i18n.changeLanguage(event.target.value)
  }

  return (
    <>
      <button
        ref={toggleRef}
        type='button'
        className='a11y-toggle'
        onClick={() => setIsOpen(true)}
        aria-label={t('accessibility.openPanel')}
        aria-expanded={isOpen}
        aria-controls='accessibility-panel'
      >
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden='true'>
          <circle cx='12' cy='12' r='3' />
          <path d='M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14' />
        </svg>
        {t('accessibility.tools')}
      </button>

      {isOpen && (
        <div
          className='a11y-overlay'
          onClick={() => setIsOpen(false)}
          aria-hidden='true'
        />
      )}

      <div
        id='accessibility-panel'
        ref={panelRef}
        className={`a11y-panel ${isOpen ? 'open' : ''}`}
        role='dialog'
        aria-modal='true'
        aria-labelledby='accessibility-panel-title'
        aria-hidden={!isOpen}
        inert={!isOpen ? '' : undefined}
      >
        <div className='panel-header'>
          <h2 id='accessibility-panel-title'>{t('accessibility.title')}</h2>
          <button
            ref={closeRef}
            type='button'
            className='close-btn'
            onClick={() => setIsOpen(false)}
            aria-label={t('accessibility.closePanel')}
          >
            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden='true'>
              <path d='M18 6 6 18M6 6l12 12' />
            </svg>
          </button>
        </div>

        <div className='section'>
          <div className='section-label'>
            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden='true'>
              <path d='M4 7V4h16v3M9 20h6M12 4v16' />
            </svg>
            {t('accessibility.textSize')}
          </div>
          <div className='btn-group'>
            <button type='button' className={`opt-btn ${textSize === 'default' ? 'active' : ''}`} onClick={() => setTextSize('default')}>{t('accessibility.default')}</button>
            <button type='button' className={`opt-btn ${textSize === 'large' ? 'active' : ''}`} onClick={() => setTextSize('large')}>{t('accessibility.large')}</button>
            <button type='button' className={`opt-btn ${textSize === 'extra-large' ? 'active' : ''}`} onClick={() => setTextSize('extra-large')}>{t('accessibility.extraLarge')}</button>
          </div>
        </div>

        <div className='section'>
          <div className='section-label'>
            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden='true'>
              <circle cx='12' cy='12' r='5' />
              <path d='M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42' />
            </svg>
            {t('accessibility.theme')}
          </div>
          <div className='btn-group row'>
            <button type='button' className={`opt-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
              {t('accessibility.light')}
            </button>
            <button type='button' className={`opt-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
              {t('accessibility.dark')}
            </button>
          </div>
        </div>

        <div className='section'>
          <div className='section-label'>
            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden='true'>
              <circle cx='12' cy='12' r='10' />
              <path d='M12 2a10 10 0 0 1 0 20V2z' fill='currentColor' />
            </svg>
            {t('accessibility.highContrast')}
          </div>
          <button
            type='button'
            className={`opt-btn full-width ${highContrast ? 'active' : ''}`}
            onClick={() => setHighContrast(!highContrast)}
            aria-pressed={highContrast}
          >
            {highContrast ? t('accessibility.enabled') : t('accessibility.disabled')}
          </button>
        </div>

        <div className='section'>
          <div className='section-label'>
            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden='true'>
              <circle cx='12' cy='12' r='10' />
              <path d='M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' />
            </svg>
            {t('accessibility.language')}
          </div>
          <label className='sr-only' htmlFor='accessibility-language'>
            {t('accessibility.selectLanguage')}
          </label>

          {/* DT-147: Added Hindi and Punjabi options to the language selector */}
          <select
            id='accessibility-language'
            value={['en', 'es', 'pa', 'hi'].find((lang) => i18n.language.startsWith(lang)) || 'en'}
            onChange={handleLanguageChange}
            aria-label={t('accessibility.selectLanguage')}
          >
            <option value='en'>English</option>
            <option value='es'>Español</option>
            <option value='pa'>ਪੰਜਾਬੀ</option>
            <option value='hi'>हिन्दी</option>
          </select>
        </div>

        <div className='notice' role='note'>
          {t('accessibility.screenReaderNotice')}
        </div>
      </div>
    </>
  )
}

export default AccessibilityPanel
