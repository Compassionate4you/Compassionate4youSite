import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/scheduling.css';

export default function ViewAppointmentDetailsPage() {
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
                    <h2>{t('details.notFoundTitle')}</h2>
                    <p className="desc">{t('details.notFoundMessage')}</p>
                    <button type="button" className="btn-primary" onClick={() => navigate('/schedule')}>
                        {t('details.scheduleAppointment')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="content appointment-page">
            <div className="section-box">
                <h2>{t('details.title')}</h2>
                <p className="desc">{t('details.subtitle')}</p>

                <div className="appointment-details" aria-label={t('details.detailsLabel')}>
                    <p><strong>{t('details.name')}:</strong> {appointment.fullName}</p>
                    <p><strong>{t('details.phone')}:</strong> {appointment.phone}</p>
                    <p><strong>{t('details.email')}:</strong> {appointment.email}</p>
                    <p><strong>{t('details.service')}:</strong> {appointment.serviceType}</p>
                    <p><strong>{t('details.date')}:</strong> {new Date(`${appointment.date}T00:00:00`).toLocaleDateString()}</p>
                    <p><strong>{t('details.time')}:</strong> {appointment.timeSlot}</p>
                    {appointment.notes && <p><strong>{t('details.notes')}:</strong> {appointment.notes}</p>}
                </div>

                <button type="button" className="btn-secondary" onClick={() => navigate('/portal')}>
                    {t('details.returnDashboard')}
                </button>
            </div>
        </div>
    );
}
