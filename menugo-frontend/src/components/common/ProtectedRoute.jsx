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

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect based on role
    if (user?.role === 'restaurant_admin') {
      return <Navigate to="/admin/dashboard" replace />
    }
    if (user?.role === 'waiter') {
      return <Navigate to="/waiter/dashboard" replace />
    }
    if (user?.role === 'platform_admin') {
      return <Navigate to="/platform/dashboard" replace />
    }
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute