// src/components/common/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
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

  return children;
};

export default ProtectedRoute;