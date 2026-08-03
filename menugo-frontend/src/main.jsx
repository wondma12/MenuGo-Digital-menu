import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { registerSW } from './pwa/sw-register'
import App from './App'
import './styles/index.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
})

// Clear stale service workers before registration so the browser doesn't keep
// serving an old broken bundle after a production deploy.
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().catch(() => {})
      })
    })
  } else if (import.meta.env.PROD) {
    registerSW().catch(() => {})
  }
}

// Monkey-patch HTMLMediaElement.play to catch AbortError rejections and avoid
// unhandled promise errors when play() is interrupted by a pause or navigation.
if (typeof window !== 'undefined' && typeof HTMLMediaElement !== 'undefined') {
  try {
    (function patchMediaPlay() {
      const originalPlay = HTMLMediaElement.prototype.play
      if (!originalPlay || originalPlay.__patched) return
      const wrapped = function patchedPlay(...args) {
        const result = originalPlay.apply(this, args)
        if (result && typeof result.then === 'function') {
          result.catch((err) => {
            // Ignore common AbortError caused by calling pause() during play().
            if (err && err.name === 'AbortError') return
            // Preserve default behavior for other errors by rethrowing asynchronously
            setTimeout(() => { throw err })
          })
        }
        return result
      }
      try {
        wrapped.__patched = true
        HTMLMediaElement.prototype.play = wrapped
      } catch (e) {
        // ignore assignment errors in some sandboxed environments
      }
    })()
  } catch (e) {
    // ignore
  }
}

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  // You can send to error tracking service here
})

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason
  
  // Suppress auth-missing errors (user not logged in, no token)
  if (reason?.isAuthMissing || reason?.message?.includes('No auth token present')) {
    event.preventDefault()
    if (import.meta.env.DEV) {
      console.debug('Suppressed: Auth-missing error (user not logged in)')
    }
    return
  }
  
  // Suppress 5xx server errors (backend issues, timeouts, etc.)
  const statusCode = reason?.response?.status
  if (statusCode >= 500 || reason?.message?.includes('503') || reason?.message?.includes('500')) {
    event.preventDefault()
    if (import.meta.env.DEV) {
      console.debug(`Suppressed: Server error (${statusCode}) - backend may be starting up or experiencing issues`)
    }
    return
  }
  
  const isAbortedMediaPlay =
    reason?.name === 'AbortError' &&
    typeof reason?.message === 'string' &&
    reason.message.includes('play() request was interrupted')

  // Ignore known browser media-play interruption noise from stale tabs/extensions.
  if (isAbortedMediaPlay) {
    event.preventDefault()
    return
  }

  console.error('Unhandled promise rejection:', event.reason)
})

// Initialize app
const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>
)
