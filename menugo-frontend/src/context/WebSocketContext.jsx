// src/context/WebSocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const socketInstance = io(import.meta.env.VITE_WS_URL || import.meta.env.WS_URL || (typeof window !== 'undefined' ? window.location.origin : ''), {
      transports: ['websocket'],
      auth: { token }
    });

    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      socketInstance.emit('authenticate', token);
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};