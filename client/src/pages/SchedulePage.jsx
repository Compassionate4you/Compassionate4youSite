import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiCreateAppointment, apiGetAvailability } from '../services/api';
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    // DT-562: slots already booked for the chosen date, so the form only
    // offers times that are actually free.
    const [takenSlots, setTakenSlots] = useState([]);

    useEffect(() => {
        if (!form.date) {
            setTakenSlots([]);
            return undefined;
        }

        let cancelled = false;
        apiGetAvailability(form.date)
            .then((data) => {
                if (cancelled) return;
                setTakenSlots(
                    (data.slots || [])
                        .filter((slot) => !slot.available)
                        .map((slot) => slot.timeSlot)
                );
            })
            .catch(() => {
                // Availability is a convenience - the server still rejects
                // a double booking on submit.
                if (!cancelled) setTakenSlots([]);
            });

        return () => {
            cancelled = true;
        };
    }, [form.date]);

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => {
            const next = { ...current, [name]: value };
            // Changing the date invalidates a slot chosen for the old one.
            if (name === 'date') next.timeSlot = '';
            return next;
        });
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitting) return;

        if (
            !form.fullName.trim() ||
            !form.phone.trim() ||
            !form.email.trim() ||
            !form.serviceType ||
            !form.date ||
            !form.timeSlot
        ) {
            setError(t('schedule.requiredError'));
            return;
        }

        const appointment = {
            ...form,
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            notes: form.notes.trim(),
        };

        setIsSubmitting(true);
        try {
            // DT-563 / DT-564: save it, linked to the account when signed in.
            const data = await apiCreateAppointment(appointment);
            const saved = data.appointment ?? appointment;

            sessionStorage.setItem('newAppointment', JSON.stringify(saved));
            navigate('/schedule/confirmation', { state: { appointment: saved } });
        } catch (err) {
            setError(err.message || t('schedule.requiredError'));
        } finally {
            setIsSubmitting(false);
        }
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

                    {/* noValidate so the page's own error message is used
                        instead of the browser's native validation popups. */}
                    <form onSubmit={handleSubmit} noValidate>
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
                                <option value="Home Health">{t('schedule.homeHealth')}</option>
                                <option value="Hospice Care">{t('schedule.hospiceCare')}</option>
                                <option value="Consultation">{t('schedule.generalConsultation')}</option>
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="date">{t('schedule.preferredDate')}</label>
                            <input id="date" name="date" value={form.date} onChange={updateField} type="date" required />
                        </div>
                        <div className="field">
                            <label htmlFor="timeSlot">{t('schedule.time')}</label>
                            <select id="timeSlot" name="timeSlot" value={form.timeSlot} onChange={updateField} required>
                                <option value="">{t('schedule.selectTime')}</option>
                                {[
                                    ['9:00 AM', 'schedule.times.9'],
                                    ['10:00 AM', 'schedule.times.10'],
                                    ['11:00 AM', 'schedule.times.11'],
                                    ['1:00 PM', 'schedule.times.1'],
                                    ['2:00 PM', 'schedule.times.2'],
                                    ['3:00 PM', 'schedule.times.3'],
                                ].map(([value, labelKey]) => {
                                    const taken = takenSlots.includes(value);
                                    return (
                                        <option key={value} value={value} disabled={taken}>
                                            {t(labelKey)}
                                            {taken ? ` - ${t('schedule.slotTaken')}` : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="notes">{t('schedule.notes')}</label>
                            <textarea id="notes" name="notes" value={form.notes} onChange={updateField} placeholder={t('schedule.notesPlaceholder')} />
                        </div>

                        {error && <div className="form-error" role="alert">{error}</div>}

                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? t('schedule.submitting') : t('schedule.confirm')}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => navigate('/portal')}>{t('schedule.cancel')}</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SchedulePage;
