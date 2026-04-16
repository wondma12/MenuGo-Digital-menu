import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../common/Button'
import { socialLogin } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const SocialLogin = () => {
  const navigate = useNavigate()
  const { login: setAuth } = useAuthStore()

  const handleSocialLogin = async (provider) => {
    try {
      // Redirect to OAuth provider
      window.location.href = `${API_URL}/auth/${provider}`
    } catch (error) {
      console.error('Social login failed:', error)
    }
  }

  // Handle OAuth callback on mount
  React.useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      const user = urlParams.get('user')
      
      if (token && user) {
        setAuth(JSON.parse(decodeURIComponent(user)), token)
        const role = JSON.parse(decodeURIComponent(user)).role
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
    }
    handleCallback()
  }, [navigate, setAuth])

  return (
    <div className="space-y-3">
      <Button
        onClick={() => handleSocialLogin('google')}
        variant="outline"
        fullWidth
        className="flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      <Button
        onClick={() => handleSocialLogin('facebook')}
        variant="outline"
        fullWidth
        className="flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
          <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/>
        </svg>
        Continue with Facebook
      </Button>

      <Button
        onClick={() => handleSocialLogin('apple')}
        variant="outline"
        fullWidth
        className="flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="#000" viewBox="0 0 24 24">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8.95-.26 2.02-.84 3.32-.78 1.37.06 2.78.66 3.65 1.78-1.44.9-2.14 2.32-1.89 3.96.26 1.55 1.23 2.93 2.84 3.54-1.07 2.02-2.42 3.09-4 3.67zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
        Continue with Apple
      </Button>
    </div>
  )
}

export default SocialLogin
