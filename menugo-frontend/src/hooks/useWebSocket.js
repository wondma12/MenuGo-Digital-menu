import { useEffect, useState, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

let socket = null
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000'

export const useWebSocket = () => {
  const { token, user } = useAuthStore()
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [messages, setMessages] = useState([])
  const eventHandlers = useRef(new Map())

  useEffect(() => {
    if (!token || !user) return

    // Initialize socket connection
    socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      console.log('WebSocket connected')
      setIsConnected(true)
      // Join user-specific room
      socket.emit('join', { userId: user.id, role: user.role })
    })

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    })

    socket.on('new_order', (data) => {
      setLastMessage({ type: 'new_order', ...data })
      setMessages(prev => [{ type: 'new_order', ...data, timestamp: new Date() }, ...prev].slice(0, 50))
      // Trigger custom event handlers
      const handlers = eventHandlers.current.get('new_order') || []
      handlers.forEach(handler => handler(data))
    })

    socket.on('order_updated', (data) => {
      setLastMessage({ type: 'order_updated', ...data })
      setMessages(prev => [{ type: 'order_updated', ...data, timestamp: new Date() }, ...prev].slice(0, 50))
      const handlers = eventHandlers.current.get('order_updated') || []
      handlers.forEach(handler => handler(data))
    })

    socket.on('order_ready', (data) => {
      setLastMessage({ type: 'order_ready', ...data })
      setMessages(prev => [{ type: 'order_ready', ...data, timestamp: new Date() }, ...prev].slice(0, 50))
      const handlers = eventHandlers.current.get('order_ready') || []
      handlers.forEach(handler => handler(data))
    })

    socket.on('table_status', (data) => {
      setLastMessage({ type: 'table_status', ...data })
      const handlers = eventHandlers.current.get('table_status') || []
      handlers.forEach(handler => handler(data))
    })

    socket.on('call_request', (data) => {
      setLastMessage({ type: 'call_request', ...data })
      const handlers = eventHandlers.current.get('call_request') || []
      handlers.forEach(handler => handler(data))
    })

    socket.on('notification', (data) => {
      setLastMessage({ type: 'notification', ...data })
      setMessages(prev => [{ type: 'notification', ...data, timestamp: new Date() }, ...prev].slice(0, 50))
      const handlers = eventHandlers.current.get('notification') || []
      handlers.forEach(handler => handler(data))
    })

    return () => {
      if (socket) {
        socket.disconnect()
        socket = null
      }
    }
  }, [token, user])

  const sendMessage = useCallback((event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data)
    }
  }, [isConnected])

  const onEvent = useCallback((event, handler) => {
    if (!eventHandlers.current.has(event)) {
      eventHandlers.current.set(event, [])
    }
    eventHandlers.current.get(event).push(handler)

    return () => {
      const handlers = eventHandlers.current.get(event)
      if (handlers) {
        const index = handlers.indexOf(handler)
        if (index > -1) handlers.splice(index, 1)
      }
    }
  }, [])

  const joinRoom = useCallback((room) => {
    if (socket && isConnected) {
      socket.emit('join_room', room)
    }
  }, [isConnected])

  const leaveRoom = useCallback((room) => {
    if (socket && isConnected) {
      socket.emit('leave_room', room)
    }
  }, [isConnected])

  return {
    isConnected,
    lastMessage,
    messages,
    sendMessage,
    onEvent,
    joinRoom,
    leaveRoom,
  }
}

export default useWebSocket
