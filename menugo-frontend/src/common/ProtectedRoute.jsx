// src/components/common/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If a token exists in session storage or a persisted auth snapshot,
    // render a loading state while the app restores authentication.
    try {
      const sessionToken = typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null
      const persisted = typeof window !== 'undefined' ? window.sessionStorage.getItem('auth-storage') : null

      if (sessionToken) return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      )

      if (persisted) {
        const parsed = JSON.parse(persisted)
        if (parsed && (parsed.token || parsed.isAuthenticated)) return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        )
      }
    } catch (e) {
      // ignore storage access
    }
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  const userRole = user?.role || user?.staff?.role;
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect based on user role
    if (userRole === 'platform_admin') return <Navigate to="/platform/dashboard" replace />;
    if (userRole === 'restaurant_admin') return <Navigate to="/admin/dashboard" replace />;
    if (userRole === 'chef') return <Navigate to="/chef/kitchen" replace />;
    if (userRole === 'waiter') return <Navigate to="/waiter/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;