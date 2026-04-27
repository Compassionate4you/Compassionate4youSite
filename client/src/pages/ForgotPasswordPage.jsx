// Forgot password page (DT-341). UI only - backend not wired yet.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/portal.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS_RE = /^[+]?\d{7,15}$/;

function looksLikeEmail(value) {
    return EMAIL_RE.test(value);
}

function looksLikePhone(value) {
    const digits = value.replace(/[\s().\-]/g, '');
    return PHONE_DIGITS_RE.test(digits);
}

function ForgotPasswordPage() {
    const { t } = useTranslation();

    const [identifier, setIdentifier] = useState('');
    const [errorKey, setErrorKey] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const value = identifier.trim();

        if (!value) {
            setErrorKey('login.reset.errors.required');
            return;
        }

        if (!looksLikeEmail(value) && !looksLikePhone(value)) {
            setErrorKey('login.reset.errors.invalid');
            return;
        }

        // TODO: POST /api/auth/forgot-password when backend is built.
        setErrorKey(null);
        setSubmitted(true);
    };

    return (
        <div>
            <div className="navbar">
                <div className="navbar-title">{t('portal.title')}</div>
            </div>

            <div className="content">
                <div className="section-box">
                    <h2>{t('login.reset.title')}</h2>
                    <p className="desc">{t('login.reset.subtitle')}</p>

                    {submitted ? (
                        <>
                            <div className="form-success" role="status">
                                {t('login.reset.confirmation')}
                            </div>
                            <Link to="/login" className="back-link">
                                {t('login.reset.backToLogin')}
                            </Link>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate>
                            <div
                                className={`field${
                                    errorKey ? ' field--error' : ''
                                }`}
                            >
                                <label htmlFor="reset-identifier">
                                    {t('login.reset.emailOrPhone')}
                                </label>
                                <input
                                    id="reset-identifier"
                                    type="text"
                                    autoComplete="username"
                                    placeholder={t(
                                        'login.reset.emailOrPhonePlaceholder'
                                    )}
                                    value={identifier}
                                    onChange={(e) => {
                                        setIdentifier(e.target.value);
                                        if (errorKey) setErrorKey(null);
                                    }}
                                    aria-invalid={errorKey ? 'true' : 'false'}
                                />
                            </div>

                            {errorKey && (
                                <div className="form-error" role="alert">
                                    {t(errorKey)}
                                </div>
                            )}

                            <div className="login-actions">
                                <button type="submit" className="btn-primary">
                                    {t('login.reset.submit')}
                                </button>
                                <Link to="/login" className="login-forgot-link">
                                    {t('login.reset.backToLogin')}
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
