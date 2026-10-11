// AuthContext (DT-336 / DT-556). Talks to the backend auth endpoints and
// keeps the session alive across reloads via the server's session cookie.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiLogin, apiLogout, apiMe, apiSignup, ApiError } from '../services/api';

// Test accounts, kept so the UI can be exercised without a seeded database.
const HARDCODED_ADMIN = {
    email: 'admin@compassionate4you.com',
    password: 'admin123',
    role: 'admin',
    displayName: 'Admin User',
};

const HARDCODED_CUSTOMER = {
    email: 'customer@compassionate4you.com',
    password: 'customer123',
    role: 'customer',
    displayName: 'Customer User',
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    // True until the session check finishes, so guards don't redirect early.
    const [isLoading, setIsLoading] = useState(true);

    // DT-560: restore the session on load.
    useEffect(() => {
        let cancelled = false;

        apiMe()
            .then((data) => {
                if (cancelled || !data?.user) return;
                setUser({
                    id: data.user.id,
                    email: data.user.email,
                    role: 'customer',
                    displayName: data.user.email,
                });
            })
            .catch(() => {
                // Not signed in, or the API is unreachable.
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const matchTestAccount = useCallback((email, password) => {
        for (const account of [HARDCODED_ADMIN, HARDCODED_CUSTOMER]) {
            if (email === account.email && password === account.password) {
                return account;
            }
        }
        return null;
    }, []);

    const login = useCallback(
        async (email, password) => {
            const normalizedEmail = String(email || '').trim().toLowerCase();
            const normalizedPassword = String(password || '');

            if (!normalizedEmail || !normalizedPassword) {
                return { ok: false, errorKey: 'login.errors.required' };
            }

            if (!/.+@.+\..+/.test(normalizedEmail)) {
                return { ok: false, errorKey: 'login.errors.invalidEmail' };
            }

            const testAccount = matchTestAccount(normalizedEmail, normalizedPassword);
            if (testAccount) {
                setUser({
                    email: testAccount.email,
                    role: testAccount.role,
                    displayName: testAccount.displayName,
                });
                return { ok: true, role: testAccount.role };
            }

            try {
                const data = await apiLogin(normalizedEmail, normalizedPassword);
                setUser({
                    id: data.user?.id ?? data.userId,
                    email: data.user?.email ?? normalizedEmail,
                    role: 'customer',
                    displayName: data.user?.email ?? normalizedEmail,
                });
                return { ok: true, role: 'customer' };
            } catch (err) {
                if (err instanceof ApiError && err.status === 400) {
                    return { ok: false, error: err.message, field: err.field };
                }
                return { ok: false, errorKey: 'login.errors.network' };
            }
        },
        [matchTestAccount]
    );

    const signup = useCallback(async (email, password) => {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const normalizedPassword = String(password || '');

        if (!normalizedEmail || !normalizedPassword) {
            return { ok: false, errorKey: 'login.errors.required' };
        }

        if (!/.+@.+\..+/.test(normalizedEmail)) {
            return { ok: false, errorKey: 'login.errors.invalidEmail' };
        }

        try {
            const data = await apiSignup(normalizedEmail, normalizedPassword);
            setUser({
                id: data.user?.id ?? data.userId,
                email: data.user?.email ?? normalizedEmail,
                role: 'customer',
                displayName: data.user?.email ?? normalizedEmail,
            });
            return { ok: true, role: 'customer' };
        } catch (err) {
            if (err instanceof ApiError && err.status === 400) {
                return { ok: false, error: err.message, field: err.field };
            }
            return { ok: false, errorKey: 'login.errors.network' };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await apiLogout();
        } catch {
            // Clear locally even if the request fails.
        }
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({
            user,
            isLoading,
            isAuthenticated: user !== null,
            login,
            signup,
            logout,
        }),
        [user, isLoading, login, signup, logout]
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
