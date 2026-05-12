import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Input from '../common/Input'
import Button from '../common/Button'
import Alert from '../common/Alert'
import { verifyTwoFactor } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'

const TwoFactorAuth = () => {
  const navigate = useNavigate()
  const location = useLocation()
  // We'll set auth state directly after successful 2FA
  const setAuth = (user, token) => {
    try {
      useAuthStore.setState({ user, token, isAuthenticated: true })
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    } catch (e) {
      console.error('Failed to set auth state:', e)
    }
  }
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [backupCode, setBackupCode] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)

  const email = location.state?.email || ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const response = await verifyTwoFactor(email, code, useBackupCode ? backupCode : undefined)
      setAuth(response.user, response.token)
      // Redirect based on role
      const role = response.user?.role
      if (role === 'platform_admin') {
        navigate('/platform/dashboard')
      } else if (role === 'restaurant_admin') {
        navigate('/admin/dashboard')
      } else if (role === 'waiter') {
        navigate('/waiter/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <img src="/logo.svg" alt="MenuGo" className="mx-auto h-12 w-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Two-factor authentication</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the verification code from your authenticator app.
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && <Alert type="error" message={error} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!useBackupCode ? (
              <Input
                label="Verification code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
              />
            ) : (
              <Input
                label="Backup code"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
                placeholder="Enter backup code"
                required
              />
            )}

            <Button type="submit" isLoading={isLoading} fullWidth>
              Verify
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setUseBackupCode(!useBackupCode)}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              {useBackupCode ? 'Use authenticator app' : 'Use backup code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TwoFactorAuth