import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Loading from './Loading'

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore()

  if (isLoading) {
    return <Loading fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user?.role) || allowedRoles.includes(user?.staff?.role)
    if (!hasRole) {
      // Prefer staff role for redirects when available
      const effectiveRole = user?.staff?.role || user?.role

      if (effectiveRole === 'restaurant_admin' || user?.role === 'restaurant_admin') {
        return <Navigate to="/admin/dashboard" replace />
      }
      if (effectiveRole === 'waiter' || user?.role === 'waiter') {
        return <Navigate to="/waiter/dashboard" replace />
      }
      if (user?.role === 'platform_admin') {
        return <Navigate to="/platform/dashboard" replace />
      }
      if (effectiveRole === 'chef') {
        return <Navigate to="/chef/kitchen" replace />
      }
      return <Navigate to="/" replace />
    }
  }

  return <Outlet />
}

export default ProtectedRoute