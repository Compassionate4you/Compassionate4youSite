import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiCreateAppointment, apiGetAvailability } from '../services/api'
import '../styles/portal.css'
import '../styles/scheduling.css'

const TIME_SLOTS = [
  ['9:00 AM', 'schedule.times.9'],
  ['10:00 AM', 'schedule.times.10'],
  ['11:00 AM', 'schedule.times.11'],
  ['1:00 PM', 'schedule.times.1'],
  ['2:00 PM', 'schedule.times.2'],
  ['3:00 PM', 'schedule.times.3']
]

// Order matters: the first invalid field in this list gets focus.
const FIELD_ORDER = ['fullName', 'phone', 'email', 'serviceType', 'date', 'timeSlot']

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function todayString () {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function SchedulePage () {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    serviceType: '',
    date: '',
    timeSlot: '',
    notes: ''
  })

  // DT-719: errors are stored as translation keys, keyed by field name,
  // so they re-translate if the language changes. `formError` is for
  // problems that do not belong to one field (network down, server error).
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef(null)

  // DT-562: slots already booked for the chosen date. `availabilityKey`
  // is bumped to re-fetch after the server says a slot was just taken.
  const [takenSlots, setTakenSlots] = useState([])
  const [availabilityKey, setAvailabilityKey] = useState(0)

  useEffect(() => {
    if (!form.date) {
      setTakenSlots([])
      return undefined
    }

    let cancelled = false
    apiGetAvailability(form.date)
      .then((data) => {
        if (cancelled) return
        setTakenSlots(
          (data.slots || [])
            .filter((slot) => !slot.available)
            .map((slot) => slot.timeSlot)
        )
      })
      .catch(() => {
        // Availability is a convenience - the server still rejects
        // a double booking on submit.
        if (!cancelled) setTakenSlots([])
      })

    return () => {
      cancelled = true
    }
  }, [form.date, availabilityKey])

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => {
      const next = { ...current, [name]: value }
      // Changing the date invalidates a slot chosen for the old one.
      if (name === 'date') next.timeSlot = ''
      return next
    })

    // Clear only the error of the field being edited.
    setFieldErrors((current) => {
      if (!current[name] && !(name === 'date' && current.timeSlot)) return current
      const next = { ...current }
      delete next[name]
      if (name === 'date') delete next.timeSlot
      return next
    })
    setFormError('')
  }

  // Returns { field: translationKey } for every invalid field.
  const validate = (values) => {
    const errors = {}
    if (!values.fullName.trim()) errors.fullName = 'schedule.errors.fullName'
    if (!values.phone.trim()) errors.phone = 'schedule.errors.phone'
    if (!values.email.trim()) errors.email = 'schedule.errors.email'
    else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'schedule.errors.emailInvalid'
    if (!values.serviceType) errors.serviceType = 'schedule.errors.serviceType'
    if (!values.date) errors.date = 'schedule.errors.date'
    else if (values.date < todayString()) errors.date = 'schedule.errors.datePast'
    if (!values.timeSlot) errors.timeSlot = 'schedule.errors.timeSlot'
    return errors
  }

  const focusFirstError = (errors) => {
    const first = FIELD_ORDER.find((name) => errors[name])
    if (first) formRef.current?.querySelector(`#${first}`)?.focus()
  }

  // Turn a server validation error into a translation key for its field.
  // The server sends English text, so match on the field (and, for the
  // time slot, on the "just been booked" wording).
  const serverErrorKey = (err) => {
    if (err.field === 'timeSlot' && /booked/i.test(err.message || '')) {
      return 'schedule.errors.slotTaken'
    }
    if (err.field === 'email') return 'schedule.errors.emailInvalid'
    if (FIELD_ORDER.includes(err.field)) return `schedule.errors.${err.field}`
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const errors = validate(form)
    setFieldErrors(errors)
    setFormError('')
    if (Object.keys(errors).length > 0) {
      focusFirstError(errors)
      return
    }

    const appointment = {
      ...form,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      notes: form.notes.trim()
    }

    setIsSubmitting(true)
    try {
      // DT-563 / DT-564: saved on the server, linked to the account when
      // the person is signed in. Guests can still book.
      const data = await apiCreateAppointment(appointment)
      const saved = data.appointment ?? appointment

      sessionStorage.setItem('newAppointment', JSON.stringify(saved))
      navigate('/schedule/confirmation', { state: { appointment: saved } })
    } catch (err) {
      const key = serverErrorKey(err)
      if (key) {
        const field = err.field
        setFieldErrors({ [field]: key })

        // Slot taken: drop the choice and refresh which slots are free.
        if (key === 'schedule.errors.slotTaken') {
          setForm((current) => ({ ...current, timeSlot: '' }))
          setAvailabilityKey((n) => n + 1)
        }
        focusFirstError({ [field]: key })
      } else {
        setFormError('schedule.errors.generic')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Props shared by every input so errors are announced and styled.
  const fieldProps = (name) => ({
    id: name,
    name,
    value: form[name],
    onChange: updateField,
    'aria-invalid': fieldErrors[name] ? 'true' : undefined,
    'aria-describedby': fieldErrors[name] ? `${name}-error` : undefined
  })

  const renderError = (name) => (
    fieldErrors[name]
      ? <p id={`${name}-error`} className='field-error' role='alert'>{t(fieldErrors[name])}</p>
      : null
  )

  return (
    <div>
      <div className='content'>
        <div className='section-box'>
          <h2>{t('schedule.title')}</h2>
          <p className='desc'>{t('schedule.subtitle')}</p>

          {/* noValidate so the page's own messages are used instead of
              the browser's native validation popups. */}
          <form ref={formRef} onSubmit={handleSubmit} noValidate>
            <div className='field'>
              <label htmlFor='fullName'>{t('schedule.fullName')}</label>
              <input {...fieldProps('fullName')} type='text' placeholder={t('schedule.fullNamePlaceholder')} required />
              {renderError('fullName')}
            </div>
            <div className='field'>
              <label htmlFor='phone'>{t('schedule.phone')}</label>
              <input {...fieldProps('phone')} type='tel' placeholder={t('schedule.phonePlaceholder')} required />
              {renderError('phone')}
            </div>
            <div className='field'>
              <label htmlFor='email'>{t('schedule.email')}</label>
              <input {...fieldProps('email')} type='email' placeholder={t('schedule.emailPlaceholder')} required />
              {renderError('email')}
            </div>
            <div className='field'>
              <label htmlFor='serviceType'>{t('schedule.serviceType')}</label>
              <select {...fieldProps('serviceType')} required>
                <option value=''>{t('schedule.selectService')}</option>
                <option value='Home Health'>{t('schedule.homeHealth')}</option>
                <option value='Hospice Care'>{t('schedule.hospiceCare')}</option>
                <option value='Consultation'>{t('schedule.generalConsultation')}</option>
              </select>
              {renderError('serviceType')}
            </div>
            <div className='field'>
              <label htmlFor='date'>{t('schedule.preferredDate')}</label>
              <input {...fieldProps('date')} type='date' min={todayString()} required />
              {renderError('date')}
            </div>
            <div className='field'>
              <label htmlFor='timeSlot'>{t('schedule.time')}</label>
              <select {...fieldProps('timeSlot')} required>
                <option value=''>{t('schedule.selectTime')}</option>
                {TIME_SLOTS.map(([value, labelKey]) => {
                  const taken = takenSlots.includes(value)
                  return (
                    <option key={value} value={value} disabled={taken}>
                      {t(labelKey)}
                      {taken ? ` - ${t('schedule.slotTaken')}` : ''}
                    </option>
                  )
                })}
              </select>
              {renderError('timeSlot')}
            </div>
            <div className='field'>
              <label htmlFor='notes'>{t('schedule.notes')}</label>
              <textarea id='notes' name='notes' value={form.notes} onChange={updateField} placeholder={t('schedule.notesPlaceholder')} />
            </div>

            {formError && <div className='form-error' role='alert'>{t(formError)}</div>}

            <button type='submit' className='btn-primary' disabled={isSubmitting}>
              {isSubmitting ? t('schedule.submitting') : t('schedule.confirm')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SchedulePage