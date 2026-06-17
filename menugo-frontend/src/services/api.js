import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// Default API base URL.
// Use the explicit backend URL when provided, otherwise fall back to the local
// backend port used by this project. Using an absolute URL avoids Vite proxy
// dependencies and prevents ECONNREFUSED noise when the proxy backend is absent.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api'

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
  // Probe a contiguous range of common local backend ports to improve
  // auto-detection when the backend picks a nearby free port.
  const FALLBACK_PORTS = Array.from({ length: 11 }, (_, i) => 5000 + i)

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

// Ensure we probe for a working API base once per session before sending
// any requests. This avoids the race where the app sends `/auth/me` while
// the frontend is still using a stale or incorrect baseURL.
let baseProbePromise = null
const ensureApiBaseReady = () => {
  if (baseProbePromise) return baseProbePromise
  baseProbePromise = (async () => {
    const cacheKey = 'menugo_api_base'
    const cached = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(cacheKey) : null
    // Shorter probe timeout and parallel probing to reduce startup latency
    const probeTimeout = 800

    if (cached) {
      try {
        await axios.get(`${cached.replace(/\/$/, '')}/health`, { timeout: probeTimeout })
        api.defaults.baseURL = cached
        if (import.meta.env.DEV) console.warn('Using cached API baseURL:', cached)
        return
      } catch (e) {
        if (import.meta.env.DEV) console.warn('Cached api base failed probe, clearing cache:', e && e.message)
        try { sessionStorage.removeItem(cacheKey) } catch (err) {}
      }
    }

    const candidates = buildApiCandidates()
    const cap = Math.min(candidates.length, 6)

    // Probe candidates in parallel and use the first successful one.
    const probePromises = candidates.slice(0, cap).map((candidate) => {
      const base = candidate.replace(/\/$/, '')
      const healthUrl = `${base}/health`
      return axios.get(healthUrl, { timeout: probeTimeout })
        .then(() => base)
        .catch(() => Promise.reject(base))
    })

    try {
      const winner = await Promise.any(probePromises)
      api.defaults.baseURL = winner
      try { if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(cacheKey, winner) } catch (e) { if (import.meta.env.DEV) console.warn('sessionStorage.setItem failed:', e && e.message) }
      if (import.meta.env.DEV) console.warn('Initial API baseURL detected:', winner)
      return
    } catch (allErr) {
      if (import.meta.env.DEV) console.warn('Initial probe: no candidate responded')
    }

    // Fall back to configured URL if nothing responded
    api.defaults.baseURL = NORMALIZED_API_URL
    if (import.meta.env.DEV) console.warn('No candidate responded; using configured NORMALIZED_API_URL:', NORMALIZED_API_URL)
  })()
  return baseProbePromise
}

  const attemptFallback = async (originalRequest) => {
  // Only attempt automatic fallback for idempotent requests to avoid
  // re-sending large uploads or mutating POSTs to unknown hosts.
  const method = (originalRequest && originalRequest.method) ? originalRequest.method.toLowerCase() : 'get'
  const requestUrl = String(originalRequest?.url || '')
  const allowMutationFallback = Boolean(originalRequest && originalRequest._allowBaseFallback)
  if (!['get', 'head'].includes(method) && !allowMutationFallback) {
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

  // Probe a small set of candidates in parallel for fallback attempts.
  const MAX_PROBES = Math.min(candidates.length, 6)
  const probeCandidates = candidates.slice(0, MAX_PROBES).map((candidate) => {
    const base = candidate.replace(/\/$/, '')
    if (base === currentBase) return Promise.reject(base)
    const healthUrl = `${base}/health`
    if (import.meta.env.DEV) console.warn('Probing fallback baseURL health:', healthUrl)
    return axios.get(healthUrl, { timeout: 1200 }).then(() => base).catch(() => Promise.reject(base))
  })

  try {
    const winner = await Promise.any(probeCandidates)
    api.defaults.baseURL = winner
    try {
      if (typeof sessionStorage !== 'undefined') {
        try { sessionStorage.setItem(cacheKey, winner) } catch (e) { if (import.meta.env.DEV) console.warn('sessionStorage.setItem failed while caching api base:', e && e.message) }
      }
    } catch (e) {}
    if (import.meta.env.DEV) console.warn('Using API fallback baseURL:', winner)
    return await api(originalRequest)
  } catch (err) {
    if (import.meta.env.DEV) console.warn('Fallback candidate probes all failed')
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
  async (config) => {
    // Ensure we've probed and selected a working API base before sending
    try {
      await ensureApiBaseReady()
    } catch (e) {
      // If probe failed, continue — the rest of the code will use the
      // configured NORMALIZED_API_URL.
      if (import.meta.env.DEV) console.warn('ensureApiBaseReady failed:', e && e.message)
    }

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
    
    // Log request in development (concise)
    if (import.meta.env.DEV) {
      try {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
      } catch (e) {}
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
            try {
              authSessionStorage.setItem('token', newToken)
            } catch (e) {
              if (import.meta.env.DEV) console.warn('authSessionStorage.setItem token failed:', e && e.message)
            }
            if (newRefreshToken) {
              try {
                authSessionStorage.setItem('refreshToken', newRefreshToken)
              } catch (e) {
                if (import.meta.env.DEV) console.warn('authSessionStorage.setItem refreshToken failed:', e && e.message)
              }
            }
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
        // Ensure we only try fallback once per request to avoid recursion. Limit
        // fallback attempts to avoid noisy console logs in dev.
        if (originalRequest && !originalRequest._retryFallback) {
          originalRequest._retryFallback = true
          try {
            return await attemptFallback(originalRequest)
          } catch (fallbackErr) {
              if (import.meta.env.DEV) console.warn('API fallback exhausted:', fallbackErr.message || fallbackErr)
            // fall through to reject original error
          }
        }
      }

      return Promise.reject(error)
  }
)

export default api