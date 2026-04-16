import { useCallback } from 'react'
import { useAuthStore } from '../store/authStore'

export const usePermissions = () => {
  const { user } = useAuthStore()

  const hasPermission = useCallback((permission) => {
    if (!user) return false
    if (user.role === 'platform_admin') return true
    return user.permissions?.includes(permission) || false
  }, [user])

  const hasAnyPermission = useCallback((permissions) => {
    return permissions.some(permission => hasPermission(permission))
  }, [hasPermission])

  const hasAllPermissions = useCallback((permissions) => {
    return permissions.every(permission => hasPermission(permission))
  }, [hasPermission])

  const isRole = useCallback((role) => {
    return user?.role === role
  }, [user])

  const isAnyRole = useCallback((roles) => {
    return roles.some(role => isRole(role))
  }, [isRole])

  const canAccessRestaurant = useCallback((restaurantId) => {
    if (!user) return false
    if (user.role === 'platform_admin') return true
    if (user.role === 'restaurant_admin') {
      return user.restaurantId === restaurantId
    }
    return false
  }, [user])

  const canAccessTable = useCallback((tableId) => {
    if (!user) return false
    if (user.role === 'platform_admin') return true
    if (user.role === 'restaurant_admin') return true
    if (user.role === 'waiter') {
      return user.assignedTables?.includes(tableId) || false
    }
    return false
  }, [user])

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRole,
    isAnyRole,
    canAccessRestaurant,
    canAccessTable,
  }
}

export default usePermissions