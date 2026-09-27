import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/scheduling.css';

export default function ClientSchedulingConfirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const appointment = location.state?.appointment || (() => {
        try {
            return JSON.parse(sessionStorage.getItem('newAppointment') || 'null');
        } catch {
            return null;
        }
    })();

    if (!appointment) {
        return (
            <div className="content appointment-page">
                <div className="section-box">
                    <h2>{t('confirmation.notFoundTitle')}</h2>
                    <p className="desc">{t('confirmation.notFoundMessage')}</p>
                    <button type="button" className="btn-primary" onClick={() => navigate('/schedule')}>
                        {t('confirmation.scheduleAgain')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="content appointment-page">
            <div className="section-box">
                <h2>{t('confirmation.title')}</h2>
                <p className="desc">{t('confirmation.message')}</p>

                <div className="appointment-details" aria-label={t('confirmation.detailsLabel')}>
                    <p><strong>{t('confirmation.name')}:</strong> {appointment.fullName}</p>
                    <p><strong>{t('confirmation.phone')}:</strong> {appointment.phone}</p>
                    <p><strong>{t('confirmation.email')}:</strong> {appointment.email}</p>
                    <p><strong>{t('confirmation.service')}:</strong> {appointment.serviceType}</p>
                    <p><strong>{t('confirmation.date')}:</strong> {new Date(`${appointment.date}T00:00:00`).toLocaleDateString()}</p>
                    <p><strong>{t('confirmation.time')}:</strong> {appointment.timeSlot}</p>
                    {appointment.notes && <p><strong>{t('confirmation.notes')}:</strong> {appointment.notes}</p>}
                </div>

                <div className="confirmation-actions">
                    <button type="button" className="btn-primary" onClick={() => navigate('/appointment-details', { state: { appointment } })}>
                        {t('confirmation.viewDetails')}
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
                        {t('confirmation.returnHome')}
                    </button>
                </div>
            </div>
        </div>
    );
}
