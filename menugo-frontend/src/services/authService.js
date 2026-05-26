import api from './api'

const normalizeEmail = (email) => String(email || '').trim().toLowerCase()

export const login = async (email, password, rememberMe) => {
  try {
    const response = await api.post('/auth/login', {
      email: normalizeEmail(email),
      password,
      rememberMe,
    })
    console.log('Login API Response:', response.data)
    return response.data
  } catch (error) {
    console.error('Login API Error:', error.response?.data || error.message)
    throw error
  }
}

export const register = async (userData) => {
  try {
    let response
    if (userData instanceof FormData) {
      response = await api.post('/auth/register', userData, { headers: { 'Content-Type': 'multipart/form-data' } })
    } else {
      response = await api.post('/auth/register', userData)
    }
    console.log('Register API Response:', response.data)
    return response.data
  } catch (error) {
    console.error('Register API Error:', error.response?.data || error.message)
    throw error
  }
}

export const logout = async () => {
  try {
    const response = await api.post('/auth/logout')
    return response.data
  } catch (error) {
    if (error.response?.status === 401) {
      return { success: true, message: 'Already logged out' }
    }
    throw error
  }
}

export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh-token')
    return response.data
  } catch (error) {
    console.error('Refresh Token Error:', error.response?.data || error.message)
    throw error
  }
}

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email: normalizeEmail(email) })
    return response.data
  } catch (error) {
    console.error('Forgot Password Error:', error.response?.data || error.message)
    throw error
  }
}

export const resetPassword = async (token, password, confirmPassword = password) => {
  try {
    const response = await api.post('/auth/reset-password', {
      token,
      password,
      newPassword: password,
      confirmPassword,
    })
    return response.data
  } catch (error) {
    console.error('Reset Password Error:', error.response?.data || error.message)
    throw error
  }
}

export const verifyEmail = async (token) => {
  try {
    const response = await api.post('/auth/verify-email', { token })
    return response.data
  } catch (error) {
    console.error('Verify Email Error:', error.response?.data || error.message)
    throw error
  }
}

export const resendVerificationEmail = async (email) => {
  try {
    const response = await api.post('/auth/resend-verification', { email })
    return response.data
  } catch (error) {
    console.error('Resend Verification Error:', error.response?.data || error.message)
    throw error
  }
}

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword })
    return response.data
  } catch (error) {
    console.error('Change Password Error:', error.response?.data || error.message)
    throw error
  }
}

export const updateProfile = async (data) => {
  try {
    const response = await api.put('/auth/profile', data)
    return response.data
  } catch (error) {
    console.error('Update Profile Error:', error.response?.data || error.message)
    throw error
  }
}

export const setupTwoFactor = async () => {
  try {
    const response = await api.post('/auth/2fa/setup')
    return response.data
  } catch (error) {
    console.error('Setup 2FA Error:', error.response?.data || error.message)
    throw error
  }
}

export const verifyTwoFactor = async (email, code, backupCode) => {
  try {
    const response = await api.post('/auth/2fa/verify', { email, code, backupCode })
    return response.data
  } catch (error) {
    console.error('Verify 2FA Error:', error.response?.data || error.message)
    throw error
  }
}

export const disableTwoFactor = async (code) => {
  try {
    const response = await api.post('/auth/2fa/disable', { code })
    return response.data
  } catch (error) {
    console.error('Disable 2FA Error:', error.response?.data || error.message)
    throw error
  }
}

export const socialLogin = async (provider, token) => {
  try {
    const response = await api.post(`/auth/${provider}`, { token })
    return response.data
  } catch (error) {
    console.error('Social Login Error:', error.response?.data || error.message)
    throw error
  }
}

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me')
    console.log('Get Current User Response:', response.data)
    return response.data
  } catch (error) {
    console.error('Get Current User Error:', error.response?.data || error.message)
    throw error
  }
}

// Backwards-compatible aggregate export for callers that import `authService`
const authService = {
  login,
  register,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  changePassword,
  updateProfile,
  setupTwoFactor,
  verifyTwoFactor,
  disableTwoFactor,
  socialLogin,
  getCurrentUser,
}

export { authService }
export default authService
