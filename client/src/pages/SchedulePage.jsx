import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './styles/portal.css';

function SchedulePage() {
    const { t } = useTranslation();
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

    return (
        <div>
            {/* DT-61: Schedule an Appointment page */}
            <div className="navbar">
                <div className="navbar-left">
                    <div className="avatar">CH</div>
                    <div>
                        <div className="navbar-title">{t('portal.title')}</div>
                        <div className="navbar-subtitle">{t('portal.welcome')}</div>
                    </div>
                </div>
                <div className="navbar-right">
{                   /* Home button goes back to portal */}
                    <button onClick={() => navigate('/portal')}>{t('nav.home')}</button>                    
{                      /* DT-64: Logout goes to login page */}
                    <button onClick={() => navigate('/login')}>{t('nav.logout')}</button>                
                </div>
            </div>

            <div className="content">
                {/* Back button goes to dashboard */}
                <button className="back-btn" onClick={() => navigate('/portal')}>{t('schedule.backToDashboard')}</button>

                <div className="section-box">
                    <h2>{t('schedule.title')}</h2>
                    <p className="desc">{t('schedule.subtitle')}</p>

                    <div className="field">
                        <label>{t('schedule.fullName')}</label>
                        <input type="text" placeholder={t('schedule.fullNamePlaceholder')} />
                    </div>
                    <div className="field">
                        <label>{t('schedule.phone')}</label>
                        <input type="text" placeholder={t('schedule.phonePlaceholder')} />
                    </div>
                    <div className="field">
                        <label>{t('schedule.email')}</label>
                        <input type="email" placeholder={t('schedule.emailPlaceholder')} />
                    </div>
                    <div className="field">
                        <label>{t('schedule.serviceType')}</label>
                        <select>
                            <option>{t('schedule.selectService')}</option>
                            <option>{t('schedule.homeHealth')}</option>
                            <option>{t('schedule.hospiceCare')}</option>
                            <option>{t('schedule.generalConsultation')}</option>
                        </select>
                    </div>
                    <div className="field">
                        <label>{t('schedule.preferredDate')}</label>
                        <input type="date" />
                    </div>
                    <div className="field">
                        <label>{t('schedule.notes')}</label>
                        <textarea placeholder={t('schedule.notesPlaceholder')}></textarea>
                    </div>

                    <button className="btn-primary" onClick={() => setShowSuccess(true)}>{t('schedule.confirm')}</button>

                    <button className="btn-secondary" onClick={() => navigate('/portal')}>{t('schedule.cancel')}</button>

                    {showSuccess && (
                        <div className="success-msg">
                            {t('schedule.successMsg')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SchedulePage;