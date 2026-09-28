// Sign up page (DT-491).

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import '../styles/login.css';

function SignupPage() {
    const { t } = useTranslation();
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorKey, setErrorKey] = useState(null);
    const [serverError, setServerError] = useState(null);
    const [errorField, setErrorField] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setErrorKey(null);
        setServerError(null);
        setErrorField(null);

        if (!email.trim() || !password || !confirmPassword) {
            setErrorKey('signup.errors.required');
            return;
        }

        if (password !== confirmPassword) {
            setErrorKey('signup.errors.passwordMismatch');
            setErrorField('confirmPassword');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await signup(email, password);
            if (result.ok) {
                navigate('/portal');
            } else {
                setErrorKey(result.errorKey ?? null);
                setServerError(result.error ?? null);
                setErrorField(result.field ?? null);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isEmailError = errorField === 'email' || errorKey === 'signup.errors.required';
    const isPasswordError = errorField === 'password';
    const isConfirmError = errorField === 'confirmPassword';

    return (
        <div className="login-page">
            <div className="content">
                <div className="login-header">
                    <h1>{t('signup.title')}</h1>
                    <p>{t('signup.subtitle')}</p>
                </div>

                <div className="login-card">
                    <form onSubmit={handleSubmit} noValidate>
                        <div className={`field${isEmailError ? ' field--error' : ''}`}>
                            <label htmlFor="signup-email">{t('signup.email')}</label>
                            <input
                                id="signup-email"
                                type="email"
                                autoComplete="email"
                                placeholder={t('signup.emailPlaceholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                aria-invalid={isEmailError ? 'true' : 'false'}
                            />
                        </div>

                        <div className={`field${isPasswordError ? ' field--error' : ''}`}>
                            <label htmlFor="signup-password">{t('signup.password')}</label>
                            <input
                                id="signup-password"
                                type="password"
                                autoComplete="new-password"
                                placeholder={t('signup.passwordPlaceholder')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                aria-invalid={isPasswordError ? 'true' : 'false'}
                            />
                            <p className="field-hint">{t('signup.passwordHint')}</p>
                        </div>

                        <div className={`field${isConfirmError ? ' field--error' : ''}`}>
                            <label htmlFor="signup-confirm">{t('signup.confirmPassword')}</label>
                            <input
                                id="signup-confirm"
                                type="password"
                                autoComplete="new-password"
                                placeholder={t('signup.confirmPasswordPlaceholder')}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                aria-invalid={isConfirmError ? 'true' : 'false'}
                            />
                        </div>

                        {(errorKey || serverError) && (
                            <div className="form-error" role="alert">
                                {errorKey ? t(errorKey) : serverError}
                            </div>
                        )}

                        <button type="submit" className="btn-signin-full" disabled={isSubmitting}>
                            <UserPlus size={18} />
                            {isSubmitting ? t('signup.creating') : t('signup.createAccount')}
                        </button>
                    </form>

                    <p className="login-footer-text">
                        {t('signup.haveAccount')}{' '}
                        <Link to="/login" className="login-forgot-link">
                            {t('signup.signInInstead')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;
