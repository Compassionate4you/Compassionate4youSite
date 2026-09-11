import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../styles/portal.css';

function SchedulePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState({
        fullName: '',
        phone: '',
        email: '',
        serviceType: '',
        date: '',
        timeSlot: '9:00 AM - 10:00 AM' // placeholder
    });

    // 🔹 change this later based on your auth system
    const isLoggedIn = true;

    const handleChange = (field, value) => {
        setAppointment(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        // basic validation
        if (!appointment.fullName || !appointment.serviceType || !appointment.date) {
            alert("Please fill required fields");
            return;
        }

        navigate('/confirmation', {
            state: {
                appointment,
                isLoggedIn
            }
        });
    };

    return (
        <div>
            {/* NAVBAR */}
            <div className="navbar">
                <div className="navbar-left">
                    <div className="avatar">CH</div>
                    <div>
                        <div className="navbar-title">{t('portal.title')}</div>
                        <div className="navbar-subtitle">{t('portal.welcome')}</div>
                    </div>
                </div>

                <div className="navbar-right">
                    <button onClick={() => navigate('/portal')}>
                        {t('nav.home')}
                    </button>
                    <button onClick={() => navigate('/login')}>
                        {t('nav.logout')}
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div className="content">
                <button
                    className="back-btn"
                    onClick={() => navigate('/portal')}
                >
                    {t('schedule.backToDashboard')}
                </button>

                <div className="section-box">
                    <h2>{t('schedule.title')}</h2>
                    <p className="desc">{t('schedule.subtitle')}</p>

                    {/* FULL NAME */}
                    <div className="field">
                        <label>{t('schedule.fullName')}</label>
                        <input
                            type="text"
                            value={appointment.fullName}
                            onChange={(e) => handleChange('fullName', e.target.value)}
                            placeholder={t('schedule.fullNamePlaceholder')}
                        />
                    </div>

                    {/* PHONE */}
                    <div className="field">
                        <label>{t('schedule.phone')}</label>
                        <input
                            type="text"
                            value={appointment.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            placeholder={t('schedule.phonePlaceholder')}
                        />
                    </div>

                    {/* EMAIL */}
                    <div className="field">
                        <label>{t('schedule.email')}</label>
                        <input
                            type="email"
                            value={appointment.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder={t('schedule.emailPlaceholder')}
                        />
                    </div>

                    {/* SERVICE */}
                    <div className="field">
                        <label>{t('schedule.serviceType')}</label>
                        <select
                            value={appointment.serviceType}
                            onChange={(e) => handleChange('serviceType', e.target.value)}
                        >
                            <option value="">{t('schedule.selectService')}</option>
                            <option value="Home Health">{t('schedule.homeHealth')}</option>
                            <option value="Hospice Care">{t('schedule.hospiceCare')}</option>
                            <option value="Consultation">{t('schedule.generalConsultation')}</option>
                        </select>
                    </div>

                    {/* DATE */}
                    <div className="field">
                        <label>{t('schedule.preferredDate')}</label>
                        <input
                            type="date"
                            value={appointment.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                        />
                    </div>

                    {/* NOTES */}
                    <div className="field">
                        <label>{t('schedule.notes')}</label>
                        <textarea
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder={t('schedule.notesPlaceholder')}
                        />
                    </div>

                    {/* BUTTONS */}
                    <button className="btn-primary" onClick={handleSubmit}>
                        {t('schedule.confirm')}
                    </button>

                    <button
                        className="btn-secondary"
                        onClick={() => navigate('/portal')}
                    >
                        {t('schedule.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SchedulePage;
