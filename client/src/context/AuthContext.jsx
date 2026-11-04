// AuthContext (DT-336 / DT-556 / DT-755). Talks to the backend auth endpoints and
// keeps the session alive across reloads via the server's session cookie.
// The user's role (admin or customer) always comes from the database.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiLogin, apiLogout, apiMe, apiSignup, ApiError } from '../services/api'

// Test accounts, so the UI and the role redirects (DT-755) can be exercised
// without a seeded database. They only work in local development and tests,
// never in a production build, unless VITE_ENABLE_TEST_ACCOUNTS=true is set.
const TEST_ACCOUNTS_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_TEST_ACCOUNTS === 'true'

const HARDCODED_ADMIN = {
  email: 'admin@compassionate4you.com',
  password: 'admin123',
  role: 'admin',
  displayName: 'Admin User'
}

const HARDCODED_CUSTOMER = {
  email: 'customer@compassionate4you.com',
  password: 'customer123',
  role: 'customer',
  displayName: 'Customer User'
}

const TEST_USER_KEY = 'c4y-test-user'

function matchTestAccount (email, password) {
  if (!TEST_ACCOUNTS_ENABLED) return null
  for (const account of [HARDCODED_ADMIN, HARDCODED_CUSTOMER]) {
    if (email === account.email && password === account.password) {
      return account
    }
  }
  return null
}

function readTestUser () {
  if (!TEST_ACCOUNTS_ENABLED) return null
  try {
    const raw = sessionStorage.getItem(TEST_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeTestUser (user) {
  try {
    if (user) sessionStorage.setItem(TEST_USER_KEY, JSON.stringify(user))
    else sessionStorage.removeItem(TEST_USER_KEY)
  } catch {
    // Storage can be unavailable; the test login then lasts until a reload.
  }
}

const AuthContext = createContext(null)

// The server stores the role as text. Anything that is not "admin" is a customer.
function normalizeRole (role) {
  return String(role || '').toLowerCase() === 'admin' ? 'admin' : 'customer'
}

function buildUser (apiUser, fallbackEmail) {
  return {
    id: apiUser?.id,
    email: apiUser?.email ?? fallbackEmail,
    role: normalizeRole(apiUser?.role),
    displayName: apiUser?.email ?? fallbackEmail
  }
}

export function AuthProvider ({ children }) {
  const [user, setUser] = useState(null)
  // True until the session check finishes, so guards don't redirect early.
  const [isLoading, setIsLoading] = useState(true)

  // DT-560: restore the session on load.
  useEffect(() => {
    let cancelled = false

    apiMe()
      .then((data) => {
        if (cancelled) return
        if (data?.user) {
          setUser(buildUser(data.user))
          return
        }
        // No server session: bring back a test login made earlier in this tab.
        const testUser = readTestUser()
        if (testUser) setUser(testUser)
      })
      .catch(() => {
        // Not signed in, or the API is unreachable.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const normalizedPassword = String(password || '')

    if (!normalizedEmail || !normalizedPassword) {
      return { ok: false, errorKey: 'login.errors.required' }
    }

    if (!/.+@.+\..+/.test(normalizedEmail)) {
      return { ok: false, errorKey: 'login.errors.invalidEmail' }
    }

    const testAccount = matchTestAccount(normalizedEmail, normalizedPassword)
    if (testAccount) {
      const testUser = {
        email: testAccount.email,
        role: testAccount.role,
        displayName: testAccount.displayName
      }
      writeTestUser(testUser)
      setUser(testUser)
      return { ok: true, role: testAccount.role }
    }

    try {
      const data = await apiLogin(normalizedEmail, normalizedPassword)
      const nextUser = buildUser(
        { ...data.user, id: data.user?.id ?? data.userId },
        normalizedEmail
      )
      writeTestUser(null)
      setUser(nextUser)
      return { ok: true, role: nextUser.role }
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        return { ok: false, error: err.message, field: err.field }
      }
      return { ok: false, errorKey: 'login.errors.network' }
    }
  }, [])

  const signup = useCallback(async (email, password, fullName, phone) => {
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const normalizedPassword = String(password || '')

    if (!normalizedEmail || !normalizedPassword) {
      return { ok: false, errorKey: 'login.errors.required' }
    }

    if (!/.+@.+\..+/.test(normalizedEmail)) {
      return { ok: false, errorKey: 'login.errors.invalidEmail' }
    }

    try {
      const data = await apiSignup(normalizedEmail, normalizedPassword, fullName.trim(),phone.trim())
      const nextUser = buildUser(
        { ...data.user, id: data.user?.id ?? data.userId },
        normalizedEmail
      )
      setUser(nextUser)
      return { ok: true, role: nextUser.role }
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        return { ok: false, error: err.message, field: err.field }
      }
      return { ok: false, errorKey: 'login.errors.network' }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // Clear locally even if the request fails.
    }
    writeTestUser(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      signup,
      logout
    }),
    [user, isLoading, login, signup, logout]
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth () {
  const ctx = useContext(AuthContext)
  if (ctx === null) {
    throw new Error('useAuth must be used inside an <AuthProvider>')
  }
  return ctx
}

export default AuthContext