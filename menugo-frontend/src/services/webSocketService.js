import React from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

let socket = null
let listeners = new Map()

// Derive WS URL: prefer explicit VITE_WS_URL, else derive from VITE_API_URL or current origin
let WS_URL = import.meta.env.VITE_WS_URL || import.meta.env.WS_URL || ''
if (!WS_URL) {
  try {
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.API_URL || currentOrigin || `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`
    // Convert http(s)://host(:port)/api to ws(s)://host(:port)
    WS_URL = apiUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '')
  } catch (e) {
    WS_URL = ''
  }
}

export const connectWebSocket = () => {
  // Prefer an explicit VITE_WS_URL, otherwise try a list of likely backend ports.
  const { token } = useAuthStore.getState()
  if (!token) return null
  if (socket?.connected) return socket

  // Build a single candidate derived from known API base. This avoids noisy
  // probing of multiple local ports and uses the backend the frontend is
  // already communicating with (or the configured VITE_API_URL).
  const candidates = []
  if (import.meta.env.VITE_WS_URL) candidates.push(import.meta.env.VITE_WS_URL.replace(/\/$/, ''))
  if (import.meta.env.VITE_API_URL) candidates.push(import.meta.env.VITE_API_URL.replace(/^http/, 'ws').replace(/\/$/, '').replace(/\/api$/, ''))
  // fall back to derived WS_URL
  if (WS_URL) candidates.push(WS_URL.replace(/\/$/, ''))

  // Try candidates sequentially until one connects
  const tryConnect = async () => {
    for (const url of candidates) {
      let sock = null
      try {
        sock = io(url, {
          auth: { token },
          transports: ['websocket'],
          autoConnect: false,
          reconnection: true,
          reconnectionAttempts: 5,
          timeout: 3000,
        })

        await new Promise((resolve, reject) => {
          const onConnect = () => {
            cleanup()
            resolve()
          }
          const onError = (err) => {
            cleanup()
            reject(err)
          }
          const timer = setTimeout(() => {
            cleanup()
            reject(new Error('ws timeout'))
          }, 3000)

          function cleanup() {
            clearTimeout(timer)
            try { sock.off('connect', onConnect) } catch (e) {}
            try { sock.off('connect_error', onError) } catch (e) {}
          }

          sock.once('connect', onConnect)
          sock.once('connect_error', onError)
          sock.open()
        })

        // connected
        socket = sock
        socket.on('connect', () => console.log('WebSocket connected to', url))
        socket.on('disconnect', () => console.log('WebSocket disconnected'))
        return socket
      } catch (err) {
        if (sock) {
          try { sock.close() } catch (e) {}
        }
        // try next candidate
      }
    }

    console.warn('WebSocket: all connection attempts failed')
    return null
  }

  // Kick off connection attempts (async) and return current socket if any
  tryConnect()
  return socket
}

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const onEvent = (event, callback) => {
  if (!socket) connectWebSocket()
  
  if (!listeners.has(event)) {
    listeners.set(event, [])
  }
  listeners.get(event).push(callback)
  
  socket?.on(event, callback)
  
  return () => {
    const callbacks = listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) callbacks.splice(index, 1)
    }
    socket?.off(event, callback)
  }
}

export const emitEvent = (event, data) => {
  if (socket?.connected) {
    socket.emit(event, data)
  }
}

export const joinRoom = (room) => {
  if (socket?.connected) {
    socket.emit('join_room', room)
  }
}

export const leaveRoom = (room) => {
  if (socket?.connected) {
    socket.emit('leave_room', room)
  }
}

export const isConnected = () => {
  return socket?.connected || false
}

export const WebSocketProvider = ({ children }) => {
  React.useEffect(() => {
    connectWebSocket()
    return () => disconnectWebSocket()
  }, [])

  return children
}

export const initWebSocket = () => connectWebSocket()
