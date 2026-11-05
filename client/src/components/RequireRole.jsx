// DT-755: keeps a page for one role only.
// Signed-out visitors go to the login page. Signed-in users with the wrong
// role go to their own home page (admins to /admin, customers to /portal).

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireRole ({ role, children }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  // Wait for the session check so a refresh doesn't bounce people to /login.
  if (isLoading) return null

  if (!user) {
    return <Navigate to='/login' replace state={{ from: location.pathname }} />
  }

  if (user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/portal'} replace />
  }

  return children
}