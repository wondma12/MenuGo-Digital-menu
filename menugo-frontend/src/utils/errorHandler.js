import toast from 'react-hot-toast'
import { ERROR_MESSAGES } from './constants'

export const handleApiError = (error, showToast = true) => {
  let message = ERROR_MESSAGES.SERVER_ERROR

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        message = data.message || 'Bad request. Please check your input.'
        break
      case 401:
        message = ERROR_MESSAGES.UNAUTHORIZED
        // Redirect to login if needed
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
        }
        break
      case 403:
        message = ERROR_MESSAGES.FORBIDDEN
        break
      case 404:
        message = ERROR_MESSAGES.NOT_FOUND
        break
      case 422:
        message = data.message || ERROR_MESSAGES.VALIDATION
        break
      case 429:
        message = 'Too many requests. Please try again later.'
        break
      case 500:
      case 502:
      case 503:
        message = ERROR_MESSAGES.SERVER_ERROR
        break
      default:
        message = data.message || `Error: ${status}`
    }
  } else if (error.request) {
    // Request was made but no response
    message = ERROR_MESSAGES.NETWORK
  } else {
    // Something else happened
    message = error.message || ERROR_MESSAGES.SERVER_ERROR
  }

  if (showToast) {
    toast.error(message)
  }

  return { message, status: error.response?.status }
}

export const handleSuccess = (message, showToast = true) => {
  if (showToast) {
    toast.success(message)
  }
  return { success: true, message }
}

export const handleWarning = (message, showToast = true) => {
  if (showToast) {
    toast(message, { icon: '⚠️' })
  }
  return { warning: true, message }
}

export const handleInfo = (message, showToast = true) => {
  if (showToast) {
    toast(message, { icon: 'ℹ️' })
  }
  return { info: true, message }
}

export const createErrorLogger = (context) => {
  return (error, additionalInfo = {}) => {
    console.error(`[${context}] Error:`, error, additionalInfo)
    
    // Send to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        tags: { context },
        extra: additionalInfo,
      })
    }
  }
}

export const isNetworkError = (error) => {
  return !error.response && error.request
}

export const isAuthenticationError = (error) => {
  return error.response?.status === 401
}

export const isAuthorizationError = (error) => {
  return error.response?.status === 403
}

export const isNotFoundError = (error) => {
  return error.response?.status === 404
}

export const isValidationError = (error) => {
  return error.response?.status === 422
}

export const getErrorMessage = (error, defaultMessage = ERROR_MESSAGES.SERVER_ERROR) => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return defaultMessage
}