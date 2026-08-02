import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// Default API root URL. Axios should prefer an explicit configured API URL,
// then the current browser origin, and only fall back to localhost in local
// development when that is truly the intended target.
const API_URL = import.meta.env.VITE_API_URL || import.meta.env.API_URL || ''

const normalizeApiRootUrl = (url) => {
  if (!url) return ''
  const normalized = String(url).trim().replace(/\/+$/, '')
  if (!normalized) return ''
  return normalized.replace(/\/api$/, '')
}

const normalizeApiUrl = (url) => {
  if (!url) return '/api'
  const normalized = String(url).trim().replace(/\/$/, '')
  if (!normalized) return '/api'
  return /\/api$/.test(normalized) ? normalized : `${normalized}/api`
}

const NORMALIZED_API_ROOT_URL = normalizeApiRootUrl(API_URL) || (typeof window !== 'undefined' ? window.location.origin : '')
const EXPLICIT_API_ROOT_URL = normalizeApiRootUrl(import.meta.env.VITE_API_URL || import.meta.env.API_URL || '')
const initialApiBaseURL = EXPLICIT_API_ROOT_URL || NORMALIZED_API_ROOT_URL || (typeof window !== 'undefined' ? window.location.origin : '')

// Fallback ports to try when the configured API is unreachable during local development.
// Include common local backend ports used by this repo, then other candidates.
const FALLBACK_PORTS = Array.from({ length: 21 }, (_, i) => 5000 + i)
const isProductionLike = Boolean(import.meta.env.PROD || import.meta.env.VITE_APP_ENV === 'production' || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'))

const buildApiCandidates = () => {
  const seen = new Set()
  const add = (u) => {
    if (!u) return
    const normalized = normalizeApiRootUrl(u)
    if (!seen.has(normalized)) {
      seen.add(normalized)
    }
  }

  if (import.meta.env.VITE_API_URL) add(import.meta.env.VITE_API_URL)
  if (import.meta.env.API_URL) add(import.meta.env.API_URL)

  try {
    if (typeof window !== 'undefined') {
      add(window.location.origin)
      const host = window.location.hostname || 'localhost'
      const proto = window.location.protocol || 'http:'
      const shouldProbeLocalFallback = import.meta.env.DEV || (!isProductionLike && ['localhost', '127.0.0.1', '::1'].includes(host))
      if (shouldProbeLocalFallback) {
        FALLBACK_PORTS.forEach((p) => add(`${proto}//${host}:${p}`))
        FALLBACK_PORTS.forEach((p) => add(`http://localhost:${p}`))
      }
    }
  } catch (e) {
    // ignore - window may not exist in some build-time contexts
  }

  add(NORMALIZED_API_ROOT_URL)
  return Array.from(seen)
}

const getHealthUrl = (baseUrl) => {
  try {
    const base = String(baseUrl || '').replace(/\/+$|\s+$/g, '')
    return new URL('/api/health', base).toString()
  } catch (e) {
    return `${String(baseUrl || '').replace(/\/$/, '')}/api/health`
  }
}

// Ensure we probe for a working API base once per session before sending
// any requests. This avoids the race where the app sends `/auth/me` while
// the frontend is still using a stale or incorrect baseURL.
let baseProbePromise = null
const ensureApiBaseReady = () => {
  if (baseProbePromise) return baseProbePromise
  baseProbePromise = (async () => {
    const cacheKey = 'menugo_api_base'
    // In production, use the configured API target directly and avoid probing localhost ports.
    const shouldIgnoreCache = import.meta.env.DEV || new URLSearchParams(window.location.search).has('fresh')
    const cached = !shouldIgnoreCache && typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(cacheKey) : null
    const probeTimeout = 800

    if (EXPLICIT_API_ROOT_URL) {
      try {
        if (isProductionLike) {
          api.defaults.baseURL = EXPLICIT_API_ROOT_URL
          if (import.meta.env.DEV) console.warn('Using explicit VITE_API_URL baseURL:', EXPLICIT_API_ROOT_URL)
          try { if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(cacheKey) } catch (err) {}
          return
        }

        await axios.get(getHealthUrl(EXPLICIT_API_ROOT_URL), { timeout: probeTimeout })
        api.defaults.baseURL = EXPLICIT_API_ROOT_URL
        if (import.meta.env.DEV) console.warn('Using explicit VITE_API_URL baseURL:', EXPLICIT_API_ROOT_URL)
        try { if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(cacheKey) } catch (err) {}
        return
      } catch (e) {
        if (import.meta.env.DEV) console.warn('Explicit VITE_API_URL failed probe:', e && e.message)
      }
    }

    if (cached && !shouldIgnoreCache) {
      try {
        await axios.get(getHealthUrl(cached), { timeout: probeTimeout })
        api.defaults.baseURL = cached
        if (import.meta.env.DEV) console.warn('Using cached API baseURL:', cached)
        return
      } catch (e) {
        if (import.meta.env.DEV) console.warn('Cached api base failed probe, clearing cache:', e && e.message)
        try { sessionStorage.removeItem(cacheKey) } catch (err) {}
      }
    } else if (typeof sessionStorage !== 'undefined' && !shouldIgnoreCache) {
      try { sessionStorage.removeItem(cacheKey) } catch (err) {}
    }

    const candidates = buildApiCandidates()

    const probePromises = candidates.map((candidate) => {
      const base = candidate.replace(/\/$/, '')
      const healthUrl = getHealthUrl(base)
      return axios.get(healthUrl, { timeout: probeTimeout })
        .then(() => base)
        .catch(() => Promise.reject(base))
    })

    try {
      const winner = await Promise.any(probePromises)
      api.defaults.baseURL = winner
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(cacheKey, winner)
        }
      } catch (e) {
        if (import.meta.env.DEV) console.warn('sessionStorage.setItem failed:', e && e.message)
      }
      if (import.meta.env.DEV) console.warn('Initial API baseURL detected:', winner)
      return
    } catch (allErr) {
      if (import.meta.env.DEV) console.warn('Initial probe: no candidate responded')
    }

    api.defaults.baseURL = NORMALIZED_API_ROOT_URL
    if (import.meta.env.DEV) console.warn('No candidate responded; using configured NORMALIZED_API_ROOT_URL:', NORMALIZED_API_ROOT_URL)
  })()
  return baseProbePromise
}

const attemptFallback = async (originalRequest) => {
  // Allow fallback on network failures for all methods in dev, because the
  // original attempt never reached a responsive backend. This helps recovery
  // when the configured API host is stale or the backend has moved ports.
  const requestUrl = String(originalRequest?.url || '')

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
  const currentBase = (api.defaults && api.defaults.baseURL)
    ? normalizeApiRootUrl(api.defaults.baseURL).replace(/\/$/, '')
    : NORMALIZED_API_ROOT_URL.replace(/\/$/, '')

  // Probe every candidate so fallback ports beyond the first few entries are
  // still discovered when the backend has moved because of port collisions.
  const probeCandidates = candidates.map((candidate) => {
    const base = normalizeApiRootUrl(candidate).replace(/\/$/, '')
    if (base === currentBase) return Promise.reject(base)
    const healthUrl = getHealthUrl(base)
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
  api.defaults.baseURL = NORMALIZED_API_ROOT_URL
  return Promise.reject(originalRequest._originalError || new Error('All API fallback attempts failed'))
}

  const api = axios.create({
  baseURL: initialApiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true, // Important for cookies/sessions
})

// Rewrite request paths to ensure `/api` is included when the backend expects it.
api.interceptors.request.use((config) => {
  try {
    const rawUrl = String(config.url || '')
    const baseUrl = String(api.defaults.baseURL || '')
    const parsedBase = new URL(baseUrl || window.location.origin)
    const url = new URL(rawUrl, parsedBase)
    const path = url.pathname.replace(/\/+/g, '/')

    const isSameOrigin = url.origin === parsedBase.origin
    const isRelativeRequest = !/^https?:\/\//i.test(rawUrl)

    if (isSameOrigin || isRelativeRequest) {
      if (!path.startsWith('/api/') && path !== '/api') {
        url.pathname = `/api${path}`
        config.url = `${url.pathname}${url.search}`
      }
    }
  } catch (e) {
    // ignore malformed URL; let axios handle it
  }
  return config
}, (error) => Promise.reject(error))

// Paths that don't require authentication
const publicPathRules = [
  { path: '/auth/login', methods: ['post'], exact: true },
  { path: '/auth/register', methods: ['post'], exact: true },
  { path: '/auth/refresh-token', methods: ['post'], exact: true },
  { path: '/auth/forgot-password', methods: ['post'], exact: true },
  { path: '/auth/reset-password', methods: ['post'], exact: true },
  { path: '/auth/verify-email', methods: ['post'], exact: true },
  { path: '/platform/public-summary', methods: ['get'], prefix: true },
  { path: '/platform/subscriptions/plans', methods: ['get'], exact: true },
  { path: '/menu/restaurant', methods: ['get'], prefix: true },
  { path: '/menu/items', methods: ['get'], prefix: true },
  { path: '/menu/item', methods: ['get'], prefix: true },
  { path: '/menu/categories', methods: ['get'], prefix: true },
  { path: '/restaurants', methods: ['get'], exact: true },
  { path: '/restaurants/:id', methods: ['get'], exact: true },
  { path: '/restaurants/:id/reviews', methods: ['get'], exact: true },
  { path: '/restaurants/:id/tables', methods: ['get'], exact: true },
  { path: '/restaurants/:id/tables/public', methods: ['get'], exact: true },
  { path: '/restaurants/:id/calls', methods: ['post'], exact: true },
  { path: '/reviews', methods: ['get'], prefix: true },
  { path: '/orders', methods: ['post'], exact: true },  { path: '/coupons/public/restaurant/:restaurantId', methods: ['get'], exact: true },  { path: '/public/contact', methods: ['post'], exact: true },
]

const normalizePath = (path) => String(path || '').replace(/\/+$|^\s+|\s+$/g, '')

const pathPatternToRegExp = (path, exact = false) => {
  const pattern = String(path || '')
    .split(/(:[a-zA-Z0-9_]+)/g)
    .map((segment) => {
      if (segment.startsWith(':')) {
        return '[^/]+'
      }
      return segment.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')
    })
    .join('')

  return new RegExp(`^${pattern}${exact ? '$' : '(?:/|$)'}`)
}

const isPublicPath = (requestPath, method = 'get') => {
  let normalizedRequestPath = normalizePath(requestPath).replace(/\/$/, '')
  if (normalizedRequestPath.startsWith('/api/')) {
    normalizedRequestPath = normalizedRequestPath.replace(/^\/api\//, '/')
  } else if (normalizedRequestPath === '/api') {
    normalizedRequestPath = '/'
  }
  const normalizedMethod = String(method || 'get').toLowerCase()
  return publicPathRules.some((rule) => {
    const normalizedRulePath = normalizePath(rule.path).replace(/\/$/, '')
    const methodMatches = !rule.methods || rule.methods.map((m) => String(m).toLowerCase()).includes(normalizedMethod)
    if (!methodMatches) return false

    const ruleRegex = pathPatternToRegExp(normalizedRulePath, Boolean(rule.exact))
    return ruleRegex.test(normalizedRequestPath)
  })
}

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
      // configured NORMALIZED_API_ROOT_URL.
      if (import.meta.env.DEV) console.warn('ensureApiBaseReady failed:', e && e.message)
    }

    // Get token from store or session storage (try both sources)
    const storeToken = useAuthStore.getState().token
    const sessionToken = authSessionStorage?.getItem('token')
    const token = storeToken || sessionToken

    if (import.meta.env.DEV) {
      console.log('[API] current baseURL:', api.defaults?.baseURL)
    }

    // Robust public path detection:
    // Try to resolve config.url to an absolute pathname (handles absolute URLs,
    // relative paths, and baseURL variations), then match against known publicPaths.
    let requestPath = config.url || ''
    let requestUrlObject = null
    try {
      // base may be undefined in some contexts
      const base = (api.defaults && api.defaults.baseURL) ? api.defaults.baseURL : window?.location?.origin
      requestUrlObject = new URL(String(config.url), String(base))
      requestPath = requestUrlObject.pathname || requestPath
    } catch (e) {
      // ignore – fallback to raw config.url
    }

    const method = (config.method || 'get').toLowerCase()

    const normalizedRequestPath = normalizePath(requestPath).replace(/\/$/, '').replace(/^\/api/, '')

    let isRequestPublic = isPublicPath(normalizedRequestPath, method)

    // Only public when a table-specific query is provided. This protects
    // the admin order listing endpoint from being treated as unauthenticated.
    if (normalizedRequestPath.startsWith('/orders/restaurant') && method === 'get') {
      const hasTableQuery = Boolean(
        requestUrlObject && (
          requestUrlObject.searchParams.has('table') ||
          requestUrlObject.searchParams.has('table_number')
        )
      ) || Boolean(
        config.params && (
          config.params.table || config.params.table_number
        )
      )
      isRequestPublic = Boolean(hasTableQuery)
    }

    // Special-case: allow public POST to the contact form even though the
    // same pathname is used for the admin GET listing. We only treat the
    // POST as public so unauthenticated users can submit messages, while
    // GET remains protected for admin listing.
    if (!isRequestPublic && normalizedRequestPath === '/public/contact' && method === 'post') {
      isRequestPublic = true
    }

    // Special-case: /menu/categories prefix is for viewing (GET), but POST/PUT/DELETE
    // are admin operations that must be authenticated. Only treat GET requests as public.
    if (isRequestPublic && requestPath.startsWith('/menu/categories') && method !== 'get') {
      isRequestPublic = false
    }

    // Special-case: /menu/items prefix is for viewing (GET), but POST/PUT/DELETE/PATCH
    // are admin operations that must be authenticated. Only treat GET requests as public.
    if (isRequestPublic && requestPath.startsWith('/menu/items') && method !== 'get') {
      isRequestPublic = false
    }

    // Special-case: /menu/restaurant prefix is for viewing (GET), but POST/PUT/DELETE/PATCH
    // are admin operations that must be authenticated. Only treat GET requests as public.
    if (isRequestPublic && requestPath.startsWith('/menu/restaurant') && method !== 'get') {
      isRequestPublic = false
    }

    // Special-case: /restaurants/pending-verifications is a protected admin endpoint.
    // Even though it matches the public /restaurants/:id pattern, it requires platform_admin authentication.
    if (isRequestPublic && normalizedRequestPath === '/restaurants/pending-verifications' && method === 'get') {
      isRequestPublic = false
    }

    // Special-case: /restaurants/admin/all is a protected admin endpoint.
    // Even though it matches the public /restaurants/:id pattern, it requires platform_admin authentication.
    if (isRequestPublic && normalizedRequestPath === '/restaurants/admin/all' && method === 'get') {
      isRequestPublic = false
    }

    // Debug logging for auth issues
    if (import.meta.env.DEV) {
      const isAuthRequest = requestPath.includes('/auth') && method === 'post'
      if (!isRequestPublic || isAuthRequest) {
        console.log(`[API] ${method.toUpperCase()} ${requestPath}`, {
          hasStoreToken: !!storeToken,
          hasSessionToken: !!sessionToken,
          token: token ? `${token.substring(0, 20)}...` : null,
          isRequestPublic,
          willAttachAuth: !!token && !isRequestPublic
        })
      }
    }

    // Attach token only when present and the request is not public
    if (token && !isRequestPublic) {
      config.headers.Authorization = `Bearer ${token}`
    } else if (!token && !isRequestPublic) {
      // Prevent sending unauthenticated requests to protected endpoints.
      // BUT: Only reject if this is NOT an auth request (we don't require token for login/register)
      if (!requestPath.includes('/auth/') || (requestPath.includes('/auth/') && method !== 'post')) {
        const err = new Error('No auth token present')
        err.isAuthMissing = true
        // Mark as silent so response interceptor can suppress noisy logs
        err.silent = true
        if (import.meta.env.DEV) console.warn(`[API] Auth blocked: No token for ${method.toUpperCase()} ${requestPath}`)
        return Promise.reject(err)
      }
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
    const requestPath = (() => {
      try {
        const base = (api.defaults && api.defaults.baseURL) ? api.defaults.baseURL : window?.location?.origin
        return new URL(String(requestUrl), String(base)).pathname
      } catch (e) {
        return requestUrl
      }
    })()
    const requestIsPublic = isPublicPath(requestPath, originalRequest?.method)

    // Get current token
    const token = useAuthStore.getState().token || authSessionStorage?.getItem('token')
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && token && !requestIsPublic && !originalRequest?._retry) {
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

        // Use the current api.defaults.baseURL if we've switched; otherwise fall back to configured NORMALIZED_API_ROOT_URL.
        const refreshBase = (api.defaults && api.defaults.baseURL) ? api.defaults.baseURL.replace(/\/$/, '') : NORMALIZED_API_ROOT_URL.replace(/\/$/, '')
        const refreshUrl = `${refreshBase}/api/auth/refresh-token`
        const response = await axios.post(refreshUrl, {
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
        // Suppress logging for expected auth-missing errors to avoid noise in DEV console.
        if (error.isAuthMissing || error.silent) {
          if (import.meta.env.DEV) {
            try { console.debug('Request prevented: missing auth token for', originalRequest?.url) } catch (e) {}
          }
          // Mark as silent to prevent unhandled rejection warnings
          error.silent = true
          return Promise.reject(error)
        }

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

/**
 * Get the WebSocket URL based on the current API URL
 * Converts http://host:port to ws://host:port
 * or https://host:port to wss://host:port
 */
export const getWebSocketURL = () => {
  try {
    // Get the current API base URL
    const apiUrl = api.defaults?.baseURL || NORMALIZED_API_ROOT_URL
    
    // Parse the URL
    const url = new URL(apiUrl)
    
    // Convert protocol
    const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    
    // Construct WebSocket URL (remove /api suffix if present)
    const wsUrl = `${wsProtocol}//${url.host}`
    
    return wsUrl
  } catch (e) {
    if (import.meta.env.DEV) console.warn('Error constructing WebSocket URL:', e && e.message)
    // Fallback to the current origin instead of a loopback URL.
    return typeof window !== 'undefined' ? `${window.location.origin}` : 'wss://localhost'
  }
}

export default api