
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Loading from './Loading'
import { getEffectiveRole, getRoleHomePath } from '../../utils/authRouting'

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, isLoading, token } = useAuthStore()
  const location = useLocation()
  const sessionToken = typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null
  const hasToken = Boolean(token || sessionToken)

  if (isLoading) return <Loading fullScreen />

  // Require both the auth flag and an actual token. If either is missing,
  // do not allow access to protected routes and send the user to login.
  if (!isAuthenticated || !hasToken) {
    const loginPath = `/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`
    return <Navigate to={loginPath} replace />
  }

  // If allowedRoles provided, ensure the current user's role matches.
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const userRole = getEffectiveRole(user, token || sessionToken)
    if (!userRole || !allowedRoles.includes(userRole)) {
      console.warn('ProtectedRoute: access denied for user role, redirecting to login', {
        userRole,
        allowedRoles,
      })
      const loginPath = `/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`
      return <Navigate to={loginPath} replace />
    }
  }

  return <Outlet />
}

export default ProtectedRoute