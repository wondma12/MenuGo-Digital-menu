import React from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

let socket = null
let listeners = new Map()
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000'

export const connectWebSocket = () => {
  const { token } = useAuthStore.getState()
  if (!token || socket?.connected) return socket

  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket'],
  })

  socket.on('connect', () => {
    console.log('WebSocket connected')
  })

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected')
  })

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
