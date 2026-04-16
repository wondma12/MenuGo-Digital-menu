import { io } from 'socket.io-client'

let socket = null
let listeners = new Map()
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000'

export const connectSocket = (token) => {
  if (socket?.connected) return socket

  socket = io(WS_URL, {
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
