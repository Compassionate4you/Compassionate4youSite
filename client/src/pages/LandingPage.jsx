import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function LandingPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div style={{ minHeight: '80vh', padding: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h1>{t('landing.title')}</h1>
            <p>{t('landing.subtitle')}</p>

            <button onClick={() => navigate('/home-health')}>{t('nav.homeHealth')}</button>
            <button onClick={() => navigate('/hospice')}>{t('nav.hospice')}</button>
            <button onClick={() => navigate('/locations')}>{t('nav.locations')}</button>
            <button onClick={() => navigate('/schedule')}>{t('nav.schedule')}</button>
            <button onClick={() => navigate('/login')}>{t('nav.login')}</button>
            <button onClick={() => navigate('/portal')}>{t('nav.portal')}</button>
            <button onClick={() => navigate('/admin')}>{t('nav.admin')}</button>
        </div>
    );
}

export default LandingPage;