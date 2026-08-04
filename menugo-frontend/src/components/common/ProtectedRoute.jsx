import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Loading from './Loading'
import { safeParseJSON } from '../../utils/helpers'
import { getEffectiveRole, getRoleHomePath } from '../../utils/authRouting'

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, isLoading, token } = useAuthStore()
  const sessionToken = typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null
  const hasToken = Boolean(token || sessionToken)

  if (isLoading) return <Loading fullScreen />

  // If a token is missing, do not allow access even if persisted auth state says true.
  if (!isAuthenticated || !hasToken) {
      try {
        const persisted = window?.sessionStorage?.getItem('auth-storage')
        if (sessionToken) return <Loading fullScreen />
        if (persisted) {
          const parsed = safeParseJSON(persisted)
          if (parsed && (parsed.token || parsed.isAuthenticated)) return <Loading fullScreen />
        }
      } catch (e) {
        // ignore parse/storage errors and fall through to redirect
      }

    return <Navigate to="/login" replace />
  }

  // If allowedRoles provided, ensure the current user's role matches.
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const userRole = getEffectiveRole(user)
    if (!userRole || !allowedRoles.includes(userRole)) {
      console.warn('ProtectedRoute: access denied for user role, redirecting to root', {
        userRole,
        allowedRoles,
      })
      return <Navigate to={getRoleHomePath(userRole)} replace />
    }
  }

  return <Outlet />
}

export default ProtectedRoute