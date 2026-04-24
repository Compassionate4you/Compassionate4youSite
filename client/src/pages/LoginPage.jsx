import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import '../styles/portal.css';

function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();


    return (
        <div>
            {/* DT-64: Login / Sign in page */}
            <div className="navbar">
                <div className="navbar-title">{t('portal.title')}</div>
            </div>

            <div className="content">
                <div className="section-box">
                    <h2>{t('login.title')}</h2>
                    <p className="desc">{t('login.subtitle')}</p>

                    <div className="field">
                        <label>{t('login.email')}</label>
                        <input type="email" placeholder={t('login.emailPlaceholder')} />
                    </div>
                    <div className="field">
                        <label>{t('login.password')}</label>
                        <input type="password" placeholder={t('login.passwordPlaceholder')} />
                    </div>

                    <button className="btn-primary" onClick={() => navigate('/portal')}>
                        {t('login.signIn')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;