import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { 
  login as apiLogin, 
  register as apiRegister, 
  logout as apiLogout,
  getCurrentUser,
  changePassword as apiChangePassword,
  updateProfile as apiUpdateProfile,
  setupTwoFactor as apiSetupTwoFactor,
  verifyTwoFactor as apiVerifyTwoFactor,
  disableTwoFactor as apiDisableTwoFactor,
  forgotPassword as apiForgotPassword,
  resetPassword as apiResetPassword,
  verifyEmail as apiVerifyEmail,
  resendVerificationEmail as apiResendVerification
} from '../services/authService'

let pendingLoginRequest = null
const authSessionStorage = typeof window !== 'undefined' ? window.sessionStorage : null

const getAuthValue = (key) => authSessionStorage?.getItem(key) || null
const setAuthValue = (key, value) => {
  if (authSessionStorage) authSessionStorage.setItem(key, value)
}
const removeAuthValue = (key) => {
  if (authSessionStorage) authSessionStorage.removeItem(key)
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password, rememberMe) => {
        if (pendingLoginRequest) {
          return pendingLoginRequest
        }

        if (get().isLoading) {
          return { success: false, error: 'Login already in progress' }
        }

        set({ isLoading: true, error: null })

        pendingLoginRequest = (async () => {
          try {
            const response = await apiLogin(email, password, rememberMe)
            
            console.log('Full login response:', response)
            
            // Extract data from nested response structure
            // Your backend returns: { success: true, data: { user, token, refreshToken } }
            let userData = null
            let tokenData = null
            let refreshTokenData = null
            
            if (response?.data?.user && response?.data?.token) {
              // Format: { data: { user, token } }
              userData = response.data.user
              tokenData = response.data.token
              refreshTokenData = response.data.refreshToken
            } else if (response?.user && response?.token) {
              // Format: { user, token }
              userData = response.user
              tokenData = response.token
              refreshTokenData = response.refreshToken
            } else if (response?.data) {
              // Format: { data } where data contains user and token
              userData = response.data.user || response.data
              tokenData = response.data.token
              refreshTokenData = response.data.refreshToken
            } else {
              console.error('Unexpected response structure:', response)
              throw new Error('Invalid response structure from server')
            }
            
            if (!userData || !tokenData) {
              throw new Error('Missing user or token in response')
            }
            // Attach restaurant payload if provided by the API
            const restaurantPayload = response?.data?.restaurant || response?.restaurant || response?.data?.data?.restaurant
            if (restaurantPayload && userData) {
              userData.restaurant_id = userData.restaurant_id || restaurantPayload.id || restaurantPayload._id
              userData.restaurant = restaurantPayload
            }

            // Attach staff payload (chef/waiter) if provided by the API
            const staffPayload = response?.data?.staff || response?.staff || response?.data?.data?.staff
            if (staffPayload && userData) {
              userData.staff = staffPayload
              // prefer restaurant id from staff if not already set
              userData.restaurant_id = userData.restaurant_id || staffPayload.restaurant_id || (userData.restaurant && userData.restaurant.id)
            }
            
            // Store auth in session storage so restart requires login.
            setAuthValue('token', tokenData)
            if (refreshTokenData) setAuthValue('refreshToken', refreshTokenData)
            setAuthValue('user', JSON.stringify(userData))
            
            set({
              user: userData,
              token: tokenData,
              refreshToken: refreshTokenData,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
            
            console.log('Login successful, user:', userData.email)
            return { success: true, user: userData }
            
          } catch (error) {
            console.error('Login error:', error)
            const statusCode = error.response?.status
            let errorMessage = error.response?.data?.message || error.message || 'Login failed'
            if (statusCode === 401 && /invalid credentials/i.test(String(errorMessage))) {
              errorMessage = `${errorMessage} — check your email/password or use 'Forgot password' to reset.`
            }
            set({ 
              isLoading: false, 
              error: errorMessage,
              isAuthenticated: false,
            })
            return { success: false, error: errorMessage }
          } finally {
            pendingLoginRequest = null
          }
        })()

        return pendingLoginRequest
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiRegister(userData)
          console.log('Register response:', response)
          set({ isLoading: false })
          return { success: true, data: response }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Registration failed'
          set({ isLoading: false, error: errorMessage })
          return { success: false, error: errorMessage }
        }
      },

      logout: async () => {
        try {
          await apiLogout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          // Clear auth session data
          removeAuthValue('token')
          removeAuthValue('refreshToken')
          removeAuthValue('user')
          
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      checkAuth: async () => {
        const token = get().token || getAuthValue('token')
        if (!token) return false

        set({ isLoading: true })
        try {
          const response = await getCurrentUser()
          console.log('Check auth response:', response)
          
          // Extract user from response and attach restaurant if provided
          let userData = null
          if (response?.data?.user) {
            userData = response.data.user
          } else if (response?.user) {
            userData = response.user
          } else if (response?.data) {
            userData = response.data
          } else {
            userData = response
          }

          const restaurantPayload = response?.data?.restaurant || response?.restaurant || response?.data?.data?.restaurant
          if (restaurantPayload && userData) {
            userData.restaurant_id = userData.restaurant_id || restaurantPayload.id || restaurantPayload._id
            userData.restaurant = restaurantPayload
          }
          // Attach staff payload (chef/waiter) if provided by the API
          const staffPayload = response?.data?.staff || response?.staff || response?.data?.data?.staff
          if (staffPayload && userData) {
            userData.staff = staffPayload
            userData.restaurant_id = userData.restaurant_id || staffPayload.restaurant_id || (userData.restaurant && userData.restaurant.id)
          }
          
          if (userData && userData.id) {
            set({ 
              user: userData, 
              isAuthenticated: true, 
              isLoading: false 
            })
            setAuthValue('user', JSON.stringify(userData))
            return true
          } else {
            throw new Error('Invalid user data')
          }
        } catch (error) {
          console.error('Check auth error:', error)
          // Clear invalid auth data
          removeAuthValue('token')
          removeAuthValue('refreshToken')
          removeAuthValue('user')
          
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          })
          return false
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiUpdateProfile(data)
          let updatedUser = null
          
          if (response?.data?.user) {
            updatedUser = response.data.user
          } else if (response?.user) {
            updatedUser = response.user
          } else {
            updatedUser = response.data || response
          }
          
          set({ user: updatedUser, isLoading: false })
          setAuthValue('user', JSON.stringify(updatedUser))
          return { success: true, user: updatedUser }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Update failed'
          set({ isLoading: false, error: errorMessage })
          return { success: false, error: errorMessage }
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null })
        try {
          await apiChangePassword(currentPassword, newPassword)
          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Password change failed'
          set({ isLoading: false, error: errorMessage })
          return { success: false, error: errorMessage }
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null })
        try {
          await apiForgotPassword(email)
          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Request failed'
          set({ isLoading: false, error: errorMessage })
          return { success: false, error: errorMessage }
        }
      },

      resetPassword: async (token, password) => {
        set({ isLoading: true, error: null })
        try {
          await apiResetPassword(token, password)
          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Password reset failed'
          set({ isLoading: false, error: errorMessage })
          return { success: false, error: errorMessage }
        }
      },

      verifyEmail: async (token) => {
        set({ isLoading: true, error: null })
        try {
          await apiVerifyEmail(token)
          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Verification failed'
          set({ isLoading: false, error: errorMessage })
          return { success: false, error: errorMessage }
        }
      },

      resendVerification: async (email) => {
        set({ isLoading: true, error: null })
        try {
          await apiResendVerification(email)
          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to resend verification'
          set({ isLoading: false, error: errorMessage })
          return { success: false, error: errorMessage }
        }
      },

      setupTwoFactor: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiSetupTwoFactor()
          set({ isLoading: false })
          return { success: true, data: response }
        } catch (error) {
          const errorMessage = error.response?.data?.message || '2FA setup failed'
          set({ isLoading: false, error: errorMessage })
          return { success: false, error: errorMessage }
        }
      },

      verifyTwoFactor: async (email, code, backupCode) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiVerifyTwoFactor(email, code, backupCode)
          
          let userData = null
          let tokenData = null
          
          if (response?.data?.user && response?.data?.token) {
            userData = response.data.user
            tokenData = response.data.token
          } else if (response?.user && response?.token) {
            userData = response.user
            tokenData = response.token
          }
          
          if (userData && tokenData) {
            // Attach staff payload if provided
            const staffPayload = response?.data?.staff || response?.staff || response?.data?.data?.staff
            if (staffPayload && userData) {
              userData.staff = staffPayload
              userData.restaurant_id = userData.restaurant_id || staffPayload.restaurant_id || (userData.restaurant && userData.restaurant.id)
            }

            setAuthValue('token', tokenData)
            setAuthValue('user', JSON.stringify(userData))
            
            set({
              user: userData,
              token: tokenData,
              isAuthenticated: true,
              isLoading: false,
            })
            return { success: true, user: userData }
          } else {
            throw new Error('Invalid 2FA response')
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || '2FA verification failed'
          set({ isLoading: false, error: errorMessage })
          return { success: false, error: errorMessage }
        }
      },

      disableTwoFactor: async (code) => {
        set({ isLoading: true, error: null })
        try {
          await apiDisableTwoFactor(code)
          const user = get().user
          const updatedUser = { ...user, twoFactorEnabled: false }
          set({ user: updatedUser, isLoading: false })
          setAuthValue('user', JSON.stringify(updatedUser))
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to disable 2FA'
          set({ isLoading: false, error: errorMessage })
          return { success: false, error: errorMessage }
        }
      },

      clearError: () => set({ error: null }),
      
      getAuthHeader: () => {
        const token = get().token || getAuthValue('token')
        return token ? { Authorization: `Bearer ${token}` } : {}
      },
      
      isTokenExpired: () => {
        const token = get().token || getAuthValue('token')
        if (!token) return true
        
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          return payload.exp * 1000 < Date.now()
        } catch {
          return true
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ 
        token: state.token, 
        refreshToken: state.refreshToken,
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)

export { useAuthStore }