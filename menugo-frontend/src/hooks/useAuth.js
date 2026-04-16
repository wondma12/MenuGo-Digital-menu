import { useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    setupTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,
  } = useAuthStore()

  const navigate = useNavigate()

  const handleLogin = useCallback(async (email, password, rememberMe) => {
    const result = await login(email, password, rememberMe)
    if (result.success) {
      const role = result.user?.role
      if (role === 'platform_admin') {
        navigate('/platform/dashboard')
      } else if (role === 'restaurant_admin') {
        navigate('/admin/dashboard')
      } else if (role === 'waiter') {
        navigate('/waiter/dashboard')
      } else {
        navigate('/')
      }
    }
    return result
  }, [login, navigate])

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/login')
  }, [logout, navigate])

  const handleRegister = useCallback(async (userData) => {
    const result = await register(userData)
    if (result.success) {
      navigate('/verify-email', { state: { email: userData.email } })
    }
    return result
  }, [register, navigate])

  const hasPermission = useCallback((permission) => {
    if (!user) return false
    if (user.role === 'platform_admin') return true
    return user.permissions?.includes(permission) || false
  }, [user])

  const isRole = useCallback((role) => {
    return user?.role === role
  }, [user])

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile,
    changePassword,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    setupTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,
    hasPermission,
    isRole,
  }
}

export default useAuth