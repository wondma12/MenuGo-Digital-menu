import React, { useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuthStore } from '../../store/authStore'
import Input from '../common/Input'
import Button from '../common/Button'
import Alert from '../common/Alert'
import SocialLogin from './SocialLogin'

const schema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  rememberMe: yup.boolean(),
})

// Test credentials for easy testing
// Test credentials removed for production

const Login = () => {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [showError, setShowError] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const submitLockRef = useRef(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError()
    }
  }, [clearError])

  const onSubmit = async (data) => {
    // Prevent multiple submissions
    if (isLoading || submitLockRef.current) {
      console.log('Login already in progress, skipping...')
      return
    }

    submitLockRef.current = true
    setShowError(false)
    setShowSuccess(false)
    
    console.log('Attempting login with:', data.email)
    
    try {
      const result = await login(data.email, data.password, data.rememberMe)
      
      console.log('Login result:', result)
      
      if (result?.success) {
        setShowSuccess(true)
        
        // Redirect based on role after a short delay. Prefer staff role (e.g. chef)
        setTimeout(() => {
          const persistedUser = useAuthStore.getState().user
          const srcUser = result.user || persistedUser
          // Prefer `staff.role` when available (some accounts have top-level role set to 'waiter' but staff.role='chef')
          const userRole = srcUser?.staff?.role || srcUser?.role || null
          console.log('User role (resolved):', userRole, 'source user:', srcUser)

          // Role-based routing (include chef)
          const roleRoutes = {
            platform_admin: '/platform/dashboard',
            restaurant_admin: '/admin/dashboard',
            chef: '/chef/kitchen',
            waiter: '/waiter/dashboard',
            // Send customers to the scanner so they can open a restaurant menu
            customer: '/scan',
          }

          const redirectPath = roleRoutes[userRole] || '/'
          navigate(redirectPath)
        }, 1000)
      } else {
        setShowError(true)
        console.error('Login failed:', result?.error)
      }
    } catch (err) {
      console.error('Login exception:', err)
      setShowError(true)
    } finally {
      submitLockRef.current = false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <img src="/logo.svg" alt="MenuGo" className="mx-auto h-12 w-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Success Alert */}
          {showSuccess && (
            <Alert
              type="success"
              message="Login successful! Redirecting..."
              className="mb-4"
              onClose={() => setShowSuccess(false)}
            />
          )}

          {/* Error Alert */}
          {showError && error && (
            <Alert
              type="error"
              message={error}
              className="mb-4"
              onClose={() => {
                setShowError(false)
                clearError()
              }}
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email address"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              autoComplete="email"
              required
              disabled={isLoading}
            />

            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              autoComplete="current-password"
              required
              disabled={isLoading}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                  disabled={isLoading}
                />
                <span className="ml-2 block text-sm text-gray-900">Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Forgot your password?
              </Link>
            </div>

            <Button 
              type="submit" 
              isLoading={isLoading} 
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Quick Test Login removed */}

          {/* Social Login - Optional */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <SocialLogin />
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-500 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login