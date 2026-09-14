import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/portal.css';
import '../styles/scheduling.css';

function SchedulePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        email: '',
        serviceType: '',
        date: '',
        timeSlot: '',
        notes: '',
    });
    const [error, setError] = useState('');

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        setError('');
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!form.fullName.trim() || !form.phone.trim() || !form.email.trim() || !form.serviceType || !form.date || !form.timeSlot) {
            setError('Please complete all required appointment fields.');
            return;
        }

        // The appointment object is only created/passed after validation succeeds.
        const appointment = {
            ...form,
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            notes: form.notes.trim(),
            date: form.date,
        };

        navigate('/schedule/confirmation', { state: { appointment } });
    };

    return (
        <div>
            <div className="navbar">
                <div className="navbar-left">
                    <div className="avatar">CH</div>
                    <div>
                        <div className="navbar-title">{t('portal.title')}</div>
                        <div className="navbar-subtitle">{t('portal.welcome')}</div>
                    </div>
                </div>
                <div className="navbar-right">
                    <button type="button" onClick={() => navigate('/')}>{t('nav.home')}</button>
                    <button type="button" onClick={() => navigate('/login')}>{t('nav.logout')}</button>
                </div>
            </div>

            <div className="content">
                <button type="button" className="back-btn" onClick={() => navigate('/portal')}>
                    {t('schedule.backToDashboard')}
                </button>

                <div className="section-box">
                    <h2>{t('schedule.title')}</h2>
                    <p className="desc">{t('schedule.subtitle')}</p>

                    <form onSubmit={handleSubmit}>
                        <div className="field">
                            <label htmlFor="fullName">{t('schedule.fullName')}</label>
                            <input id="fullName" name="fullName" value={form.fullName} onChange={updateField} type="text" placeholder={t('schedule.fullNamePlaceholder')} required />
                        </div>
                        <div className="field">
                            <label htmlFor="phone">{t('schedule.phone')}</label>
                            <input id="phone" name="phone" value={form.phone} onChange={updateField} type="tel" placeholder={t('schedule.phonePlaceholder')} required />
                        </div>
                        <div className="field">
                            <label htmlFor="email">{t('schedule.email')}</label>
                            <input id="email" name="email" value={form.email} onChange={updateField} type="email" placeholder={t('schedule.emailPlaceholder')} required />
                        </div>
                        <div className="field">
                            <label htmlFor="serviceType">{t('schedule.serviceType')}</label>
                            <select id="serviceType" name="serviceType" value={form.serviceType} onChange={updateField} required>
                                <option value="">{t('schedule.selectService')}</option>
                                <option value={t('schedule.homeHealth')}>{t('schedule.homeHealth')}</option>
                                <option value={t('schedule.hospiceCare')}>{t('schedule.hospiceCare')}</option>
                                <option value={t('schedule.generalConsultation')}>{t('schedule.generalConsultation')}</option>
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="date">{t('schedule.preferredDate')}</label>
                            <input id="date" name="date" value={form.date} onChange={updateField} type="date" required />
                        </div>
                        <div className="field">
                            <label htmlFor="timeSlot">Appointment Time</label>
                            <select id="timeSlot" name="timeSlot" value={form.timeSlot} onChange={updateField} required>
                                <option value="">Select a time</option>
                                <option value="9:00 AM">9:00 AM</option>
                                <option value="10:00 AM">10:00 AM</option>
                                <option value="11:00 AM">11:00 AM</option>
                                <option value="1:00 PM">1:00 PM</option>
                                <option value="2:00 PM">2:00 PM</option>
                                <option value="3:00 PM">3:00 PM</option>
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="notes">{t('schedule.notes')}</label>
                            <textarea id="notes" name="notes" value={form.notes} onChange={updateField} placeholder={t('schedule.notesPlaceholder')} />
                        </div>

                        {error && <div className="form-error" role="alert">{error}</div>}

                        <button type="submit" className="btn-primary">{t('schedule.confirm')}</button>
                        <button type="button" className="btn-secondary" onClick={() => navigate('/portal')}>{t('schedule.cancel')}</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SchedulePage;
