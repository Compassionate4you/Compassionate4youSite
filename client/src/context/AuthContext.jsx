// AuthContext (DT-336). Hardcoded admin login until backend auth is built.
// In-memory only - refresh logs out.

import { createContext, useContext, useMemo, useState } from 'react';

// TODO: swap for real backend auth.
const HARDCODED_ADMIN = {
    email: 'admin@compassionate4you.com',
    password: 'admin123',
    role: 'admin',
    displayName: 'Admin User',
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const value = useMemo(
        () => ({
            user,
            isAuthenticated: user !== null,

            login(email, password) {
                const normalizedEmail = String(email || '').trim().toLowerCase();
                const normalizedPassword = String(password || '');

                if (!normalizedEmail || !normalizedPassword) {
                    return { ok: false, errorKey: 'login.errors.required' };
                }

                const looksLikeEmail = /.+@.+\..+/.test(normalizedEmail);
                if (!looksLikeEmail) {
                    return { ok: false, errorKey: 'login.errors.invalidEmail' };
                }

                if (
                    normalizedEmail === HARDCODED_ADMIN.email &&
                    normalizedPassword === HARDCODED_ADMIN.password
                ) {
                    setUser({
                        email: HARDCODED_ADMIN.email,
                        role: HARDCODED_ADMIN.role,
                        displayName: HARDCODED_ADMIN.displayName,
                    });
                    return { ok: true };
                }

                return { ok: false, errorKey: 'login.errors.invalidCredentials' };
            },

            logout() {
                setUser(null);
            },
        }),
        [user]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (ctx === null) {
        throw new Error('useAuth must be used inside an <AuthProvider>');
    }
    return ctx;
}

export default AuthContext;
