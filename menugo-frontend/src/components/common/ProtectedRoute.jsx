import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Loading from './Loading'

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore()
  if (isLoading) return <Loading fullScreen />

  // If not authenticated, allow a short restoration window when sessionStorage
  // contains tokens we expect the app to restore from (prevents flash-logout).
  if (!isAuthenticated) {
    try {
      const sessionToken = window?.sessionStorage?.getItem('token')
      const persisted = window?.sessionStorage?.getItem('auth-storage')
      if (sessionToken) return <Loading fullScreen />
      if (persisted) {
        const parsed = JSON.parse(persisted)
        if (parsed && (parsed.token || parsed.isAuthenticated)) return <Loading fullScreen />
      }
    } catch (e) {
      // ignore parse/storage errors and fall through to redirect
    }

    return <Navigate to="/login" replace />
  }

  // If allowedRoles provided, ensure the current user's role matches.
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      console.warn('ProtectedRoute: access denied for user role, redirecting to root', {
        userRole: user?.role,
        allowedRoles,
      })
      return <Navigate to="/" replace />
    }
  }

  return <Outlet />
}

export default ProtectedRoute