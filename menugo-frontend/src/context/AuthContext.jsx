// src/context/AuthContext.jsx
import {createContext, useContext, useState, useEffect} from 'react'
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  // Session timeout in milliseconds (30 minutes)
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

  const updateLastActivity = () => {
    try {
      localStorage.setItem('lastActivity', String(Date.now()));
    } catch (e) {
      if (import.meta.env.DEV) console.warn('updateLastActivity failed:', e && e.message)
    }
  };
  

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('lastActivity');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    // If token exists, check last activity timestamp for session timeout
    if (token) {
      const last = parseInt(localStorage.getItem('lastActivity') || '0', 10) || 0;
      const now = Date.now();
      if (now - last > SESSION_TIMEOUT_MS) {
        // session expired due to inactivity
        clearSession();
        setLoading(false);
        return;
      }

      // try to fetch current user
      authService.getCurrentUser()
        .then(response => {
          setUser(response.data);
          updateLastActivity();
        })
        .catch(() => {
          clearSession();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Update last activity on user interactions
    const onActivity = () => updateLastActivity();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        const last = parseInt(localStorage.getItem('lastActivity') || '0', 10) || 0;
        if (Date.now() - last > SESSION_TIMEOUT_MS) {
          // expire session when returning to the page after timeout (e.g., machine wake)
          clearSession();
        }
      }
    };

    window.addEventListener('mousemove', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('mousedown', onActivity);
    window.addEventListener('touchstart', onActivity);
    document.addEventListener('visibilitychange', onVisibility);

    // Initialize lastActivity
    if (!localStorage.getItem('lastActivity')) updateLastActivity();

    return () => {
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('mousedown', onActivity);
      window.removeEventListener('touchstart', onActivity);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('token', newToken);
    updateLastActivity();
    setToken(newToken);
    setUser(userData);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};