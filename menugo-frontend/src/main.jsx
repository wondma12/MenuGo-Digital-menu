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

// Clear stale service workers in development so the browser doesn't keep old bundles/assets alive.
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().catch(() => {})
      })
    })
  } else if (import.meta.env.PROD) {
    registerSW()
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
