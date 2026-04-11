import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/portal.css';

function PortalPage() {
    const { t } = useTranslation();
    const [visitCount, setVisitCount] = useState(1);

    return (
        <div>
            {/* DT-59: User Dashboard / Welcome page */}
            <div className="navbar">
                <div className="navbar-left">
                    <div className="avatar">CH</div>
                    <div>
                        <div className="navbar-title">{t('portal.title')}</div>
                        <div className="navbar-subtitle">{t('portal.welcome')}</div>
                    </div>
                </div>
                <div className="navbar-right">
                    <button>{t('nav.home')}</button>
                    {/* DT-64: Logout button takes user to Login page */}
                    <button>{t('nav.logout')}</button>
                </div>
            </div>

            <div className="content">
                <div className="welcome-banner">
                    <h1>{t('portal.welcomeBanner')}</h1>
                    <p>{t('portal.welcomeSubtitle')}</p>
                </div>

                <div className="cards-row">
                    {/* DT-61: Takes user to Schedule an Appointment page */}
                    <div className="card">
                        <h3>{t('portal.scheduleCard')}</h3>
                        <p>{t('portal.scheduleCardDesc')}</p>
                    </div>

                    {/* DT-60: Upcoming Visits counter */}
                    <div className="card">
                        <h3>{t('portal.upcomingVisits')}</h3>
                        <div className="visit-number">{visitCount}</div>
                        <p>{t('portal.confirmedAppointments')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PortalPage;