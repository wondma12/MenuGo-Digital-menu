import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom'
import Button from '../common/Button'
import Alert from '../common/Alert'
import { resendVerificationEmail, verifyEmail } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'

const VerifyEmail = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const authUser = useAuthStore((state) => state.user)
  const params = useParams()
  const [email, setEmail] = useState(() => {
    const stateEmail = location.state?.email || ''
    const queryEmail = new URLSearchParams(location.search).get('email') || ''
    const storedEmail = typeof window !== 'undefined' ? window.localStorage.getItem('pendingVerificationEmail') : ''
    return stateEmail || queryEmail || storedEmail || authUser?.email || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Check if token exists in URL for verification
  useEffect(() => {
    const stateEmail = location.state?.email || ''
    const queryEmail = new URLSearchParams(location.search).get('email') || ''
    const storedEmail = typeof window !== 'undefined' ? window.localStorage.getItem('pendingVerificationEmail') : ''
    const resolvedEmail = stateEmail || queryEmail || storedEmail || authUser?.email || ''
    if (resolvedEmail) {
      setEmail(resolvedEmail)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('pendingVerificationEmail', resolvedEmail)
      }
    }

    // Support token in route param (/verify-email/:token) or query string (?token=...)
    const paramToken = params?.token
    const queryToken = new URLSearchParams(location.search).get('token')
    const token = paramToken || queryToken
    if (token) {
      handleEmailVerification(token)
    }
  }, [location, authUser])

  const handleEmailVerification = async (token) => {
    setIsLoading(true)
    try {
      const resp = await verifyEmail(token)
      setSuccess(true)
      // If backend indicates we should show the welcome landing, navigate there
      const showWelcome = resp?.data?.showWelcome || resp?.showWelcome || false
      setTimeout(() => {
        if (showWelcome) navigate('/welcome')
        else navigate('/login')
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    const resolvedEmail = email || (typeof window !== 'undefined' ? window.localStorage.getItem('pendingVerificationEmail') : '') || authUser?.email || ''
    if (!resolvedEmail) {
      setError('No email address provided')
      return
    }
    setEmail(resolvedEmail)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('pendingVerificationEmail', resolvedEmail)
    }
    setIsLoading(true)
    try {
      await resendVerificationEmail(resolvedEmail)
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Email verified!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your email has been verified. Redirecting to login...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <img src="/logo.svg" alt="MenuGo" className="mx-auto h-12 w-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verify your email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification link to your email address.
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && <Alert type="error" message={error} className="mb-4" />}
          {resendSuccess && (
            <Alert type="success" message="Verification email sent!" className="mb-4" />
          )}

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Please check your inbox and click the verification link.
            </p>
            {email && (
              <p className="text-sm text-gray-500">
                We sent it to: <strong>{email}</strong>
              </p>
            )}
            
            <Button
              onClick={handleResendEmail}
              isLoading={isLoading}
              variant="outline"
              fullWidth
            >
              Resend verification email
            </Button>

            <div>
              <Link
                to="/login"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail