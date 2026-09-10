// Login page (DT-336).

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import '../styles/portal.css';

function LoginPage() {
    const { t } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorKey, setErrorKey] = useState(null);

    const isEmailError =
        errorKey === 'login.errors.invalidEmail' ||
        errorKey === 'login.errors.required';
    const isPasswordError =
        errorKey === 'login.errors.invalidCredentials' ||
        errorKey === 'login.errors.required';

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = login(email, password);
        if (result.ok) {
            setErrorKey(null);
            navigate('/portal');
        } else {
            setErrorKey(result.errorKey);
        }
    };

    return (
        <div>
            {/* DT-64: Login page  |  DT-336: form, error UI, reset link */}
            <div className="navbar">
                <div className="navbar-title">{t('portal.title')}</div>
            </div>

            <div className="content">
                <div className="section-box">
                    <h2>{t('login.title')}</h2>
                    <p className="desc">{t('login.subtitle')}</p>

                    <form onSubmit={handleSubmit} noValidate>
                        <div
                            className={`field${isEmailError ? ' field--error' : ''}`}
                        >
                            <label htmlFor="login-email">{t('login.email')}</label>
                            <input
                                id="login-email"
                                type="email"
                                autoComplete="email"
                                placeholder={t('login.emailPlaceholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                aria-invalid={isEmailError ? 'true' : 'false'}
                            />
                        </div>
                        <div
                            className={`field${isPasswordError ? ' field--error' : ''}`}
                        >
                            <label htmlFor="login-password">
                                {t('login.password')}
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                autoComplete="current-password"
                                placeholder={t('login.passwordPlaceholder')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                aria-invalid={isPasswordError ? 'true' : 'false'}
                            />
                        </div>

                        {errorKey && (
                            <div className="form-error" role="alert">
                                {t(errorKey)}
                            </div>
                        )}

                        <div className="login-actions">
                            <button type="submit" className="btn-primary">
                                {t('login.signIn')}
                            </button>
                            <Link
                                to="/forgot-password"
                                className="login-forgot-link"
                            >
                                {t('login.forgotPassword')}
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;