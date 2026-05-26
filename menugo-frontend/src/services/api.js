import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// Default API base URL.
// In development, prefer a relative `/api` so Vite's dev server proxy handles forwarding
// to the backend (avoids cross-port connection attempts and long fallback timeouts).
// In production or when `VITE_API_URL` is explicitly provided, use the configured value.
// During development prefer the Vite dev server proxy (`/api`) so requests
// are forwarded to the backend defined in `vite.config.js`. This avoids
// cross-port requests and makes local fallback probing unnecessary.
const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')

// Ensure the configured API_URL always includes the `/api` suffix so
// requests like `api.get('/dashboard/platform')` resolve to
// `http(s)://host:port/api/dashboard/platform` regardless of how
// `VITE_API_URL` was provided (with or without trailing `/api`).
const normalizeApiUrl = (url) => {
  if (!url) return url
  let normalized = url.replace(/\/$/, '')
  if (!/\/api(\/)?$/.test(normalized)) normalized = `${normalized}/api`
  return normalized
}

const NORMALIZED_API_URL = normalizeApiUrl(API_URL)

// Fallback ports to try when the configured API is unreachable during local development.
// Include common local backend ports (5002 and 5003 used by this repo), then other candidates.
const FALLBACK_PORTS = [5003, 5002, 5000, 5008, 5007, 5006, 5005]

const buildApiCandidates = () => {
  const seen = new Set()
  const add = (u) => {
    if (!u) return
    let normalized = normalizeApiUrl(u)
    if (!seen.has(normalized)) {
      seen.add(normalized)
    }
  }

  if (import.meta.env.VITE_API_URL) add(import.meta.env.VITE_API_URL)

  try {
    const host = window?.location?.hostname || 'localhost'
    const proto = window?.location?.protocol || 'http:'
    FALLBACK_PORTS.forEach((p) => add(`${proto}//${host}:${p}`))
    FALLBACK_PORTS.forEach((p) => add(`http://localhost:${p}`))
  } catch (e) {
    // ignore - window may not exist in some build-time contexts
  }

  // Always ensure API_URL is present as a last resort
  add(NORMALIZED_API_URL)

  return Array.from(seen)
}

const attemptFallback = async (originalRequest) => {
  // Only attempt automatic fallback for idempotent requests to avoid
  // re-sending large uploads or mutating POSTs to unknown hosts.
  const method = (originalRequest && originalRequest.method) ? originalRequest.method.toLowerCase() : 'get'
  if (!['get', 'head'].includes(method)) {
    return Promise.reject(originalRequest._originalError || new Error('Network error: non-idempotent request; not attempting fallback'))
  }

  // Use a small cache so we don't probe repeatedly during a dev session
  const cacheKey = 'menugo_api_base'
  const cached = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(cacheKey) : null
  if (cached) {
    api.defaults.baseURL = cached
    try {
      return await api(originalRequest)
    } catch (e) {
      // fall through to probing candidates
    }
  }

  const candidates = buildApiCandidates()
  const currentBase = (api.defaults && api.defaults.baseURL) ? api.defaults.baseURL.replace(/\/$/, '') : NORMALIZED_API_URL.replace(/\/$/, '')

  // Limit the number of probes and use a short probe timeout to avoid long delays
  let probed = 0
  const MAX_PROBES = 3
  for (const candidate of candidates) {
    if (probed >= MAX_PROBES) break
    const base = candidate.replace(/\/$/, '')
    if (base === currentBase) continue
    probed += 1
    try {
      const healthUrl = `${base.replace(/\/$/, '')}/health`
      if (import.meta.env.DEV) console.warn('Probing fallback baseURL health:', healthUrl)
      await axios.get(healthUrl, { timeout: 1200 })
      // If probe succeeded, switch base and cache it for this session
      api.defaults.baseURL = base
      try {
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(cacheKey, base)
      } catch (e) {
        // ignore storage errors
      }
      if (import.meta.env.DEV) console.warn('Using API fallback baseURL:', base)
      return await api(originalRequest)
    } catch (err) {
      if (import.meta.env.DEV) console.warn('Fallback candidate probe failed:', base, (err && err.message) || err)
      // try next candidate
    }
  }

  // restore default and give up
  api.defaults.baseURL = NORMALIZED_API_URL
  return Promise.reject(originalRequest._originalError || new Error('All API fallback attempts failed'))
}

const api = axios.create({
  baseURL: NORMALIZED_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true, // Important for cookies/sessions
})

// Paths that don't require authentication
const publicPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh-token',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
]

// Flag to prevent multiple refresh token calls
let isRefreshing = false
let failedQueue = []
const authSessionStorage = typeof window !== 'undefined' ? window.sessionStorage : null

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    // Get token from store
    const token = useAuthStore.getState().token || authSessionStorage?.getItem('token')
    
    // Add token to headers if it exists and not a public path
    const isPublicPath = publicPaths.some(path => config.url?.includes(path))
    if (token && !isPublicPath) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // If this is a file upload (FormData) increase timeout to avoid client-side
    // timeouts for large uploads or slow Cloudinary responses.
    try {
      const isFormData = (typeof FormData !== 'undefined') && (config.data instanceof FormData)
      const contentType = config.headers && (config.headers['Content-Type'] || config.headers['content-type'] || '')
      if (isFormData || /multipart\//i.test(contentType)) {
        config.timeout = 120000 // 2 minutes
      }
    } catch (e) {
      // ignore
    }
    
    // Log request in development
      if (import.meta.env.DEV) {
        let dataToLog = config.data
        try {
          dataToLog = config.data ? JSON.parse(JSON.stringify(config.data)) : config.data
        } catch (err) {
          dataToLog = '[unserializable]'
        }
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, dataToLog)
      }
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log response in development (safe stringify)
    if (import.meta.env.DEV) {
      let dataToLog = response.data
      try {
        dataToLog = response.data ? JSON.parse(JSON.stringify(response.data)) : response.data
      } catch (err) {
        dataToLog = '[unserializable]'
      }
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: dataToLog
      })
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const requestUrl = originalRequest?.url || ''
    const isPublicPath = publicPaths.some(path => requestUrl.includes(path))
    
    // Get current token
    const token = useAuthStore.getState().token || authSessionStorage?.getItem('token')
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && token && !isPublicPath && !originalRequest?._retry) {
      console.log('Token expired, attempting refresh...')
      
      if (isRefreshing) {
        // Queue requests while refreshing token
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => Promise.reject(err))
      }
      
      originalRequest._retry = true
      isRefreshing = true
      
      try {
        // Attempt to refresh token
        const refreshToken = useAuthStore.getState().refreshToken || authSessionStorage?.getItem('refreshToken')

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // Use the current api.defaults.baseURL if we've switched; otherwise fall back to configured NORMALIZED_API_URL.
        const refreshBase = (api.defaults && api.defaults.baseURL) ? api.defaults.baseURL.replace(/\/$/, '') : NORMALIZED_API_URL.replace(/\/$/, '')
        const response = await axios.post(`${refreshBase}/auth/refresh-token`, {
          refreshToken
        })
        
        let newToken = null
        let newRefreshToken = null
        
        // Extract new token from response
        if (response.data?.data?.token) {
          newToken = response.data.data.token
          newRefreshToken = response.data.data.refreshToken
        } else if (response.data?.token) {
          newToken = response.data.token
          newRefreshToken = response.data.refreshToken
        }
        
        if (newToken) {
          // Update store with new tokens
          useAuthStore.setState({ 
            token: newToken, 
            refreshToken: newRefreshToken,
            isAuthenticated: true 
          })
          
          // Update session auth storage
          if (authSessionStorage) {
            authSessionStorage.setItem('token', newToken)
            if (newRefreshToken) authSessionStorage.setItem('refreshToken', newRefreshToken)
          }
          
          // Update failed requests queue
          processQueue(null, newToken)
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        } else {
          throw new Error('Invalid refresh response')
        }
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        processQueue(refreshError, null)
        
        // Clear auth state
        useAuthStore.getState().logout()
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response?.data?.message)
      // Optionally redirect to unauthorized page
      // window.location.href = '/unauthorized'
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('Resource not found:', requestUrl)
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout')
    }

      if (!error.response) {
        console.error('Network error:', error.message)

        // Attempt to auto-detect the running backend by trying fallback ports/hosts.
        // Ensure we only try fallback once per request to avoid recursion.
        if (originalRequest && !originalRequest._retryFallback) {
          originalRequest._retryFallback = true
          try {
            return await attemptFallback(originalRequest)
          } catch (fallbackErr) {
            if (import.meta.env.DEV) console.warn('API fallback exhausted:', fallbackErr)
            // fall through to reject original error
          }
        }
      }

      return Promise.reject(error)
  }
)

export default api