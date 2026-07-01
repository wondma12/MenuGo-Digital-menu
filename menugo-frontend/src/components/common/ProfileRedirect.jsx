import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { getRoleHomePath } from '../../utils/authRouting'

const ProfileRedirect = () => {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role === 'platform_admin') {
    return <Navigate to="/platform/profile" replace />
  }

  if (user?.role === 'restaurant_admin') {
    return <Navigate to="/admin/profile" replace />
  }

  if (user?.role === 'waiter') {
    return <Navigate to="/waiter/profile" replace />
  }

  return <Navigate to={getRoleHomePath(user)} replace />
}

export default ProfileRedirect
