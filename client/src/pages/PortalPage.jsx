import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Calendar, Settings, Pencil, Trash2, MessageCircle } from 'lucide-react'

// DT-278: loads, cancels, and reschedules the signed in user's appointments through the backend
import { apiGetMyAppointments, apiCancelAppointment, apiRescheduleAppointment, apiGetAvailability } from '../services/api'
import '../styles/portal.css'

// DT-278 (726): Times a user can pick when rescheduling.
// Must match TIME_SLOTS in server/src/controllers/appointmentController.js
const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM']

// DT-278 (726): Today's date as YYYY-MM-DD, so the date picker can't pick past days
function todayString () {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// DT-278: The database sends appointments in a different shape than the table uses
// (serviceType, date as 2026-10-13, timeSlot, status as PENDING).
// This changes each one into the shape the table expects.
function toDisplayAppt (appt) {
  // Status comes in all caps (PENDING), so change it to Pending
  const status = appt.status ? appt.status.charAt(0) + appt.status.slice(1).toLowerCase() : 'Pending'
  return {
    id: appt.id,

    // DT-278 (726): keep the original date (YYYY-MM-DD) for the reschedule date picker
    rawDate: appt.date,
    service: appt.serviceType,
    // Change 2026-10-13 into October 13, 2026
    date: new Date(`${appt.date}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    time: appt.timeSlot,
    // The database doesn't have a provider column yet
    provider: 'TBD',
    status
  }
}

function getAppointmentDateTime (appt) {
  const startTime = appt.time.split(' - ')[0]
  return new Date(`${appt.date} ${startTime}`)
}

function PortalPage () {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const saved = JSON.parse(localStorage.getItem('profileSettings') || '{}')

  const [showProfile, setShowProfile] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [fullName, setFullName] = useState(saved.fullName || 'John Doe')
  const [email, setEmail] = useState(saved.email || 'customer@example.com')
  const [phone, setPhone] = useState(saved.phone || '(555) 123-4567')
  const [address, setAddress] = useState(saved.address || '123 Main St')
  const [city, setCity] = useState(saved.city || 'Sacramento')
  const [state, setState] = useState(saved.state || 'California')
  const [zip, setZip] = useState(saved.zip || '95819')
  const [emergencyName, setEmergencyName] = useState(saved.emergencyName || 'Jane Doe')
  const [emergencyPhone, setEmergencyPhone] = useState(saved.emergencyPhone || '(555) 987-6543')
  const [emailNotif, setEmailNotif] = useState(saved.emailNotif ?? true)
  const [smsNotif, setSmsNotif] = useState(saved.smsNotif ?? false)
  const [preferredContact, setPreferredContact] = useState(saved.preferredContact || 'email')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [apptTab, setApptTab] = useState('upcoming')
  const [showContactForm, setShowContactForm] = useState(false)
  const [messageSent, setMessageSent] = useState(false)
  const [contactForm, setContactForm] = useState({ fullName: '', reason: '', message: '' })

  // DT-278: Removed mock appointments The list starts empty and gets filled from the backend
  const [appointments, setAppointments] = useState([])
  // DT-278: Message to show if the appointments can't be loaded
  const [loadError, setLoadError] = useState('')

  // DT-278 (725): Message to show if cancelling fails
  const [actionError, setActionError] = useState('')

  // DT-278 (726): Reschedule window. Holds the appointment being moved, or null when closed
  const [rescheduleAppt, setRescheduleAppt] = useState(null)
  const [newDate, setNewDate] = useState('')
  const [newTimeSlot, setNewTimeSlot] = useState('')

  // times already booked on the picked date
  const [takenSlots, setTakenSlots] = useState([])
  const [rescheduleError, setRescheduleError] = useState('')
  const [isSaving, setIsSaving] = useState(false)




  // DT-278: When the page opens, get the signed-in user's appointments.
  // The empty [] at the end means this only runs once when the page loads.
  useEffect(() => {
    apiGetMyAppointments()
      // Change each appointment into the table's shape and save them
      .then((data) => setAppointments((data.appointments || []).map(toDisplayAppt)))
      // If it fails (usually because the user isn't signed in), show a message
      .catch(() => setLoadError('Could not load your appointments. Please sign in and try again.'))
  }, [])

  function getUpcomingAppointments () {
    const now = new Date()

    return appointments.find((appt) => {
      // DT-278: New bookings start as Pending, so only skip cancelled ones.
      // Otherwise the bell would never show.
      if (appt.status === 'Cancelled') return false

      const apptDateTime = getAppointmentDateTime(appt)
      const hoursUntil = (apptDateTime - now) / (1000 * 60 * 60)
      return hoursUntil > 0 && hoursUntil <= 48
    })
  }

  // DT-278 (726): When a new date is picked, check which times are already taken
  useEffect(() => {
    if (!rescheduleAppt || !newDate) {
      setTakenSlots([])
      return undefined
    }
    let cancelled=false
    apiGetAvailability(newDate)
      .then((data) => {
        if (cancelled) return
        const taken=(data.slots || []).filter((slot) => !slot.available).map((slot) => slot.timeSlot)
        // This appointments own time shows as taken on its current day, so leave it out
        setTakenSlots(newDate === rescheduleAppt.rawDate ? taken.filter((slot) => slot !== rescheduleAppt.time) : taken)
      })
      .catch(() => {
        // The server still rejects a taken slot when saving
        if(!cancelled) setTakenSlots([])
      })

      // ignore old results if the date changes again before this one finishes
      return () => { cancelled = true }
  }, [newDate, rescheduleAppt])


  function isPastAppt (appt) {
    // DT-278: Cancelled and completed appointments go in the Past tab
    if (appt.status === 'Cancelled' || appt.status === 'Completed') return true

    return getAppointmentDateTime(appt) < new Date()
  }

  // DT-278: Count every upcoming appointment, not just Confirmed ones,
  // since new bookings start as Pending
  const visitCount = appointments.filter((appt) => !isPastAppt(appt)).length
  const upcomingAppt = getUpcomingAppointments()

  // DT-278 (725): Cancel an appointment and save it to the backend
  async function cancelAppointment (apptToCancel) {
    // ask first so nobody cancels by accident
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return
    setActionError('')
    try {
      // Tell the backend to cancel this appointment
      const data = await apiCancelAppointment(apptToCancel.id)

      // Swap the old appointment for the updated one the backend sent back,
      // so it moves to the Past tab as Cancelled
      setAppointments((currentAppointments) => currentAppointments.map((appt) => (
      // Match by the appointment's id from the database
      appt.id === apptToCancel.id ? toDisplayAppt(data.appointment) : appt
      )))
    } catch (err) {
    // Show the server's message, like "This appointment has already happened."
      setActionError(err.message || 'Could not cancel the appointment. Please try again.')
    }
  }

  // DT-278 (726): Open the reschedule window for one appointment
  function openReschedule(appt){
    setRescheduleAppt(appt)
    // Start with current date and time filled
    setNewDate(appt.rawDate)
    setNewTimeSlot(appt.time)
    setRescheduleError('')
  }

  // DT-278 (726): close the reschedule window
  function closeReschedule(){
    setRescheduleAppt(null)
    setRescheduleError('')
  }

  // DT-278 (726): Changing the date clears the time, since it may be taken on new day
  function handleNewDateChange(event){
    setNewDate(event.target.value)
    setNewTimeSlot('')
  }

  // DT-278 (726): Save the new date and time to the backend
  async function saveReschedule () {
    if (!newDate || !newTimeSlot) {
      setRescheduleError('Please choose a new date and time.')
      return
    }

    setIsSaving(true)
    setRescheduleError('')
    try{
      const data=await apiRescheduleAppointment(rescheduleAppt.id, newDate, newTimeSlot)
      // Swap in the updated appointment the backend sent back
      setAppointments((currentAppointments) => currentAppointments.map((appt) => (
        appt.id === rescheduleAppt.id ? toDisplayAppt(data.appointment) : appt
    )))
    closeReschedule()
    } catch (err) {
      // show the server message : "That time is already booked."
      setRescheduleError(err.message || 'Could not reschedule. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  function handleSave () {
    localStorage.setItem('profileSettings', JSON.stringify({
      fullName,
      email,
      phone,
      address,
      city,
      state,
      zip,
      emergencyName,
      emergencyPhone,
      emailNotif,
      smsNotif,
      preferredContact
    }))
    alert('Changes saved!')
    setShowProfile(false)
  }

  function handleChangePassword () {
    setPasswordError('')
    setPasswordSuccess('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    if (newPassword === currentPassword) {
      setPasswordError('New password must be different from your current password.')
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordSuccess('Password updated successfully.')
  }

  function handleOpenContactForm () {
    setContactForm({ fullName, reason: '', message: '' })
    setMessageSent(false)
    setShowContactForm(true)
  }

  function handleContactFormChange (event) {
    const { name, value } = event.target
    setContactForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }))
  }

  function handleCancelContactForm () {
    setShowContactForm(false)
    setContactForm({ fullName: '', reason: '', message: '' })
  }

  function handleSubmitContactForm (event) {
    event.preventDefault()

    if (!contactForm.fullName.trim() || !contactForm.reason.trim() || !contactForm.message.trim()) {
      return
    }

    setContactForm({ fullName: '', reason: '', message: '' })
    setShowContactForm(false)
    setMessageSent(true)
  }

  return (
    <div>
      <div className='navbar'>
        <div className='navbar-left'>
          <div className='avatar'>CH</div>
          <div>
            <div className='navbar-title'>{t('portal.title')}</div>
            <div className='navbar-subtitle'>
              Welcome, {fullName}
              {upcomingAppt && (
                <span className='notification-icon' title={`Upcoming: ${upcomingAppt.service} - ${upcomingAppt.date} at ${upcomingAppt.time.split(' - ')[0]}`}>
                  🔔
                  <span className='notification-badge'>!</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='content'>
        {showContactForm
          ? (
            <section className='portal-contact-form-card'>
              <div className='portal-contact-form-heading'>
                <h1>Contact Your Provider</h1>
                <p>Complete the form below and a member of your care team will follow up with you.</p>
              </div>

              <form onSubmit={handleSubmitContactForm}>
                <div className='field'>
                  <label htmlFor='contact-full-name'>Full Name *</label>
                  <input id='contact-full-name' type='text' name='fullName' value={contactForm.fullName} onChange={handleContactFormChange} placeholder='Enter your full name' required />
                </div>

                <div className='field'>
                  <label htmlFor='contact-reason'>Reason for Message *</label>
                  <select id='contact-reason' name='reason' value={contactForm.reason} onChange={handleContactFormChange} required>
                    <option value=''>Select a reason</option>
                    <option value='Appointment question'>Appointment question</option>
                    <option value='Home health question'>Home health question</option>
                    <option value='Hospice question'>Hospice question</option>
                    <option value='Billing question'>Billing question</option>
                    <option value='General question'>General question</option>
                    <option value='Other'>Other</option>
                  </select>
                </div>

                <div className='field'>
                  <label htmlFor='contact-message'>Message *</label>
                  <textarea id='contact-message' name='message' value={contactForm.message} onChange={handleContactFormChange} placeholder='Describe your question in more detail' rows='7' required />
                </div>

                <div className='portal-contact-form-actions'>
                  <button type='button' className='btn-secondary' onClick={handleCancelContactForm}>Cancel</button>
                  <button type='submit' className='btn-primary'>Submit Message</button>
                </div>
              </form>
            </section>
            )
          : (
            <>
              {messageSent && (
                <div className='portal-message-success' role='status'>
                  Your message was successfully sent. A member of your care team will follow up with you.
                </div>
              )}

              <div className='welcome-banner'>
                <h1>{t('portal.welcomeBanner')}</h1>
                <p>{t('portal.welcomeSubtitle')}</p>
              </div>

              <div className='cards-row'>
                <div className='card' onClick={() => navigate('/schedule')}>
                  <div className='card-icon card-icon-blue'>
                    <Plus size={20} />
                  </div>
                  <h3>{t('portal.scheduleCard')}</h3>
                  <p>{t('portal.scheduleCardDesc')}</p>
                </div>

                <div className='card'>
                  <div className='card-icon card-icon-green'>
                    <Calendar size={20} />
                  </div>
                  <h3>{t('portal.upcomingVisits')}</h3>
                  <div className='visit-number'>{visitCount}</div>
                  <p>{t('portal.confirmedAppointments')}</p>
                </div>

                <div className='card' onClick={() => setShowProfile(true)}>
                  <div className='card-icon card-icon-purple'>
                    <Settings size={20} />
                  </div>
                  <h3>Profile Settings</h3>
                  <p>Update your contact information and preferences</p>
                </div>

                <button type='button' className='card portal-contact-card' onClick={handleOpenContactForm}>
                  <div className='card-icon card-icon-contact'>
                    <MessageCircle size={20} />
                  </div>
                  <h3>Contact Your Provider</h3>
                  <p>Send a question or message to your care team</p>
                </button>
              </div>

              <div className='section-box'>
                <h2>My Appointments</h2>
                <p className='desc'>View and Manage Your Scheduled Appointments</p>

                <div className='tabs'>
                  <button className={apptTab === 'upcoming' ? 'tab active-tab' : 'tab'} onClick={() => setApptTab('upcoming')}>Upcoming</button>
                  <button className={apptTab === 'past' ? 'tab active-tab' : 'tab'} onClick={() => setApptTab('past')}>Past</button>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>Service Type</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Provider</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.filter((appt) => apptTab === 'past' ? isPastAppt(appt) : !isPastAppt(appt)).map((appt) => (
                      <tr key={appt.id}>
                        <td>{appt.service}</td>
                        <td>{appt.date}</td>
                        <td>{appt.time}</td>
                        <td>{appt.provider}</td>
                        <td>
                          <span className={appt.status === 'Confirmed' ? 'badge badge-confirmed' : 'badge badge-pending'}>
                            {appt.status}
                          </span>
                        </td>
                        <td>
                          {apptTab === 'past'
                            ? (
                              <span className={appt.status === 'Cancelled' ? 'badge badge-confirmed' : 'badge badge-pending'}>
                                {appt.status === 'Cancelled' ? 'Cancelled' : 'Completed'}
                              </span>
                              )
                            : (
                              <>
                                <button className='btn-reschedule' onClick={() => openReschedule(appt)}>
                                  <Pencil size={16} />
                                </button>
                                <button className='btn-cancel-appt' onClick={() => cancelAppointment(appt)} title='Cancel'>
                                  <Trash2 size={16} />
                                </button>
                              </>
                              )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* DT-278: Show an error if the appointments couldn't be loaded */}
                {loadError && <p className='password-error'>{loadError}</p>}

                {/* DT-278 (725): Show an error if cancelling didn't work */}
                {actionError && <p className='password-error'>{actionError}</p>}

              </div>
            </>
            )}
      </div>

      {showProfile && (
        <div className='modal-overlay'>
          <div className='modal'>
            <div className='modal-header'>
              <div>
                <h2 className='modal-title'>Profile Settings</h2>
                <p className='modal-subtitle'>Update your contact information and preferences</p>
              </div>
              <button className='modal-close' onClick={() => setShowProfile(false)}>x</button>
            </div>

            <div className='tabs'>
              <button className={activeTab === 'personal' ? 'tab active-tab' : 'tab'} onClick={() => setActiveTab('personal')}>Personal Info</button>
              <button className={activeTab === 'preferences' ? 'tab active-tab' : 'tab'} onClick={() => setActiveTab('preferences')}>Preferences</button>
              <button className={activeTab === 'security' ? 'tab active-tab' : 'tab'} onClick={() => setActiveTab('security')}>Security</button>
            </div>

            <div className='modal-body'>
              {activeTab === 'personal' && (
                <div>
                  <h3 className='section-heading'>Contact Information</h3>
                  <div className='form-row-two'>
                    <div className='field'>
                      <label>Full Name *</label>
                      <input type='text' value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div className='field'>
                      <label>Email Address *</label>
                      <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className='form-row-two'>
                    <div className='field'>
                      <label>Phone Number *</label>
                      <input type='text' value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className='field'>
                      <label>Street Address</label>
                      <input type='text' value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                  </div>
                  <div className='form-row-three'>
                    <div className='field'>
                      <label>City</label>
                      <input type='text' value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <div className='field'>
                      <label>State</label>
                      <input type='text' value={state} onChange={(e) => setState(e.target.value)} />
                    </div>
                    <div className='field'>
                      <label>ZIP Code *</label>
                      <input type='text' value={zip} onChange={(e) => setZip(e.target.value)} />
                    </div>
                  </div>

                  <h3 className='section-heading'>Emergency Contact</h3>
                  <div className='form-row-two'>
                    <div className='field'>
                      <label>Emergency Contact Name</label>
                      <input type='text' value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
                    </div>
                    <div className='field'>
                      <label>Emergency Contact Phone</label>
                      <input type='text' value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div>
                  <h3 className='section-heading'>Notification Settings</h3>
                  <div className='field'>
                    <label className='checkbox-label'>
                      <input type='checkbox' checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} />
                      Email Notifications
                    </label>
                  </div>
                  <div className='field'>
                    <label className='checkbox-label'>
                      <input type='checkbox' checked={smsNotif} onChange={(e) => setSmsNotif(e.target.checked)} />
                      SMS Notifications
                    </label>
                  </div>

                  <h3 className='section-heading'>Communication Preferences</h3>
                  <div className='field'>
                    <label>Preferred Contact Method</label>
                    <select value={preferredContact} onChange={(e) => setPreferredContact(e.target.value)}>
                      <option value='email'>Email</option>
                      <option value='phone'>Phone</option>
                      <option value='sms'>SMS</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h3 className='section-heading'>Change Password</h3>
                  <div className='field'>
                    <label htmlFor='current-password'>Current Password</label>
                    <input id='current-password' type='password' value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder='Enter current password' />
                  </div>
                  <div className='field'>
                    <label htmlFor='new-password'>New Password</label>
                    <input id='new-password' type='password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder='Enter new password' />
                  </div>
                  <div className='field'>
                    <label htmlFor='confirm-password'>Confirm New Password</label>
                    <input id='confirm-password' type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder='Re-enter new password' />
                  </div>

                  {passwordError && <p className='password-error'>{passwordError}</p>}
                  {passwordSuccess && <p className='password-success'>{passwordSuccess}</p>}

                  <button className='btn-primary' onClick={handleChangePassword}>Update Password</button>
                </div>
              )}
            </div>

            <div className='modal-footer'>
              <button className='btn-secondary' onClick={() => setShowProfile(false)}>Cancel</button>
              <button className='btn-primary' onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
      {/* DT-278 (726): Reschedule window, opens from the pencil button */}
      {rescheduleAppt && (
        <div className='modal-overlay'>
          <div className='modal'>
            <div className='modal-header'>
              <div>
                <h2 className='modal-title'>Reschedule Appointment</h2>
                <p className='modal-subtitle'>{rescheduleAppt.service}, currently {rescheduleAppt.date} at {rescheduleAppt.time}</p>
              </div>
              <button className='modal-close' onClick={closeReschedule}>x</button>
            </div>

            <div className='modal-body'>
              <div className='field'>
                <label htmlFor='reschedule-date'>New Date</label>
                <input id='reschedule-date' type='date' min={todayString()} value={newDate} onChange={handleNewDateChange} />
              </div>
              <div className='field'>
                <label htmlFor='reschedule-time'>New Time</label>
                <select id='reschedule-time' value={newTimeSlot} onChange={(e) => setNewTimeSlot(e.target.value)}>
                  <option value=''>Select a time</option>

                  {/* Taken times are grayed out */}
                  {TIME_SLOTS.map((slot) => {
                    const taken = takenSlots.includes(slot)
                    return (
                      <option key={slot} value={slot} disabled={taken}>
                        {slot}{taken ? ' - Taken' : ''}
                      </option>
                    )
                  })}
                </select>
              </div>

              {rescheduleError && <p className='password-error'>{rescheduleError}</p>}
            </div>

            <div className='modal-footer'>
              <button className='btn-secondary' onClick={closeReschedule}>Cancel</button>
              <button className='btn-primary' onClick={saveReschedule} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save New Time'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PortalPage
