import { io } from 'socket.io-client'
import api from '../services/api'

let socket = null
let listeners = new Map()

// Build a sensible default WS URL:
// 1) Prefer explicit `VITE_WS_URL` if provided
// 2) Otherwise derive from the API base URL (same host/port) and use the configured socket path
const buildWsUrl = () => {
  const envUrl = import.meta.env.VITE_WS_URL
  if (envUrl) return envUrl.replace(/\/$/, '')

  const apiBase = (api && api.defaults && api.defaults.baseURL) ? api.defaults.baseURL : (import.meta.env.VITE_API_URL || 'http://localhost:5000')
  // strip possible trailing /api
  let url = apiBase.replace(/\/api\/?$/, '')
  // socket.io client accepts http/https URLs (not ws://), so ensure http(s) scheme
  if (!/^https?:\/\//.test(url)) {
    url = url.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://')
  }

  return url
}

export const connectSocket = (token) => {
  if (socket?.connected) return socket

  const wsPath = import.meta.env.VITE_SOCKET_PATH || '/socket.io'
  const wsUrl = buildWsUrl()

  socket = io(wsUrl, {
    path: wsPath,
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    console.log('Socket connected')
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
  })

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    listeners.clear()
  }
}

export const emitEvent = (event, data) => {
  if (socket?.connected) {
    socket.emit(event, data)
  }
}

export const onEvent = (event, callback) => {
  if (!listeners.has(event)) {
    listeners.set(event, [])
  }
  listeners.get(event).push(callback)
  
  if (socket) {
    socket.on(event, callback)
  }
  
  return () => {
    const callbacks = listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) callbacks.splice(index, 1)
    }
    if (socket) {
      socket.off(event, callback)
    }
  }
}

export const offEvent = (event, callback) => {
  if (socket) {
    socket.off(event, callback)
  }
}

export const joinRoom = (room) => {
  emitEvent('join_room', { room })
}

export const leaveRoom = (room) => {
  emitEvent('leave_room', { room })
}

export const isConnected = () => {
  return socket?.connected || false
}

export const getSocket = () => socket
