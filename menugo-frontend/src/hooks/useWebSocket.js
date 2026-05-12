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
      // Join user-specific room (server will handle join by user metadata)
      socket.emit('join', { userId: user.id, role: user.role })

      // Join notifications room so user receives personal notifications
      try { socket.emit('join-notifications') } catch (e) { /* ignore */ }

      // If user is restaurant staff/owner and restaurantId available, ask server to join kitchen & restaurant rooms
      const staffRoles = ['restaurant_owner', 'restaurant_staff', 'waiter']
      const restaurantId = user.restaurantId || user.restaurant_id || null
      if (restaurantId && staffRoles.includes(user.role)) {
        try { socket.emit('join-kitchen', restaurantId) } catch (e) { /* ignore */ }
      }
    })

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    })

    // Generic handler: listen to any server event and normalize event names
    socket.onAny((event, data) => {
      try {
        const normalized = String(event).replace(/[-\s]/g, '_').toLowerCase()
        setLastMessage({ type: normalized, event, ...data })
        setMessages(prev => [{ type: normalized, event, ...data, timestamp: new Date() }, ...prev].slice(0, 50))

        // Trigger handlers registered for normalized event or raw event
        const handlers = eventHandlers.current.get(normalized) || eventHandlers.current.get(event) || []
        handlers.forEach(handler => handler(data))
      } catch (e) {
        console.error('Error handling socket event', event, e)
      }
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
    socket, // expose raw socket for edge usage
  }
}

export default useWebSocket
