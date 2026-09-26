import { LogIn } from 'lucide-react';

// Login page (DT-336).

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AccountBenefits from '../components/AccountBenefits';
import '../styles/portal.css';  // used for the navbar and content styling
import '../styles/login.css';   // used for the login form styling
function LoginPage() {
    const { t } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorKey, setErrorKey] = useState(null);
    const [serverError, setServerError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEmailError =
        errorKey === 'login.errors.invalidEmail' || 
        errorKey === 'login.errors.required';
    const isPasswordError =
        errorKey === 'login.errors.invalidCredentials' ||
        errorKey === 'login.errors.required';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setServerError(null);
        try {
            const result = await login(email, password);
            if (result.ok) {
                setErrorKey(null);
                localStorage.setItem('isLoggedIn', 'true');

                // DT-498: sends admin to admin dashboard, and customer to user dashboard
                if (result.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/portal');
                }
            } else {
                // Backend messages come back as plain text, local checks as keys.
                setErrorKey(result.errorKey ?? null);
                setServerError(result.error ?? null);
            }
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="login-page">
            {/* DT-64: Login page  |  DT-336: form, error UI, reset link */} 

            <div className="content">
                <div className="login-header">
                    <h1>{t('login.title')}</h1>
                    <p>{t('login.subtitle')}</p>
                </div>

                <div className="section-box">
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

                        {(errorKey || serverError) && (
                            <div className="form-error" role="alert">
                                {errorKey ? t(errorKey) : serverError}
                            </div>
                        )}

                        <Link to="/forgot-password" className="login-forgot-link">
                            {t('login.forgotPassword')}
                        </Link>

                        {/* DT-498: single sign-in button. Dupclicate button removed*/}
                        {/* DT-511: Add arrow icon for sign in button*/}
                        <button type="submit" className="btn-signin-full" disabled={isSubmitting}>
                            <LogIn size={18}/>
                            {isSubmitting ? t('login.signingIn') : t('login.signIn')}
                        </button>

                    </form>

                    {/* DT-498: Create account link. Current route is a placeholder*/}
                    <p className="create-account-text">
                        Don't have an account? <Link to="/signup">Create account</Link>
                    </p>
                </div>
                <AccountBenefits />
            </div>
        </div>
    );
}
export default LoginPage;