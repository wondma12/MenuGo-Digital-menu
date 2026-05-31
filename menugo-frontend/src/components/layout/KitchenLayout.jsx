// src/components/layout/KitchenLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { SUCCESS_MESSAGES } from '../../utils/constants';
import { useWebSocket } from '../../hooks/useWebSocket';
import KitchenSoundNotification from '../kitchen/KitchenSoundNotification';
import { Settings, LogOut } from 'lucide-react'
import { getRestaurantDetails } from '../../services/restaurantService';

const KitchenLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, isConnected } = useWebSocket();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [restaurantBrand, setRestaurantBrand] = useState(null);
  const [brandLoading, setBrandLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (socket && user?.restaurantId) {
      socket.emit('join-kitchen', user.restaurantId);
      return () => {
        socket.emit('leave-kitchen', user.restaurantId);
      };
    }
  }, [socket, user]);

  useEffect(() => {
    let mounted = true;

    const loadRestaurantBrand = async () => {
      setBrandLoading(true)
      const fallbackName = user?.restaurant?.name || user?.staff?.restaurant_name || 'Restaurant';
      const fallbackLogo = user?.restaurant?.logo_url || user?.restaurant?.logo || user?.restaurant?.logoUrl || user?.logo || null;
      const restaurantId = user?.restaurant_id || user?.restaurantId || user?.restaurant?.id || user?.staff?.restaurant_id;

      if (!restaurantId) {
        if (mounted) {
          setRestaurantBrand({ name: fallbackName, logo: fallbackLogo });
        }
        return;
      }

      try {
        const details = await getRestaurantDetails(restaurantId);
        if (!mounted) return;
        setRestaurantBrand({
          name: details?.name || fallbackName,
          logo: details?.logoUrl || details?.logo_url || details?.logo || fallbackLogo,
        });
        setBrandLoading(false)
      } catch (error) {
        if (!mounted) return;
        setRestaurantBrand({ name: fallbackName, logo: fallbackLogo });
        setBrandLoading(false)
      }
    };

    loadRestaurantBrand();

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    // Show a friendly toast notification on logout so kitchen users see feedback
    try {
      toast.success(SUCCESS_MESSAGES.LOGOUT || 'Logged out');
    } catch (e) {
      // ignore toast errors
    }
    navigate('/login');
  };

  const logoSrc = restaurantBrand?.logo || user?.restaurant?.logo || user?.restaurant?.logoUrl || user?.logo || null;
  const bannerSrc = user?.restaurant?.banner || user?.restaurant?.image || null;
  const restaurantName = restaurantBrand?.name || user?.restaurant?.name || user?.staff?.restaurant_name || 'Restaurant';

  const menuItems = [
    // { path: '/chef/kitchen', label: 'Active Orders', icon: <Activity className="w-5 h-5" /> },
    // { path: '/chef/completed', label: 'Completed', icon: <Check className="w-5 h-5" /> },
  ];

  const isActivePath = (p) => {
    try {
      const pathname = location.pathname || '';
      // Match exact, prefix, or contained path (handles /chef/kitchen and /kitchen)
      return pathname === p || pathname.startsWith(p) || pathname.includes(p);
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="kitchen-layout min-h-screen bg-white font-['Manrope',system-ui,sans-serif] text-gray-900">
      <KitchenSoundNotification enabled={true} />
      
      {/* Top Navigation Bar (now white with dark text to match restaurant header) */}
      <nav className="sticky top-0 z-50 border-b border-orange-100 bg-white/90 text-black shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Restaurant logo (if available) - show skeleton while loading */}
              {brandLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-md bg-gray-200 animate-pulse" />
                  <div className="h-5 w-36 rounded bg-gray-200 animate-pulse" />
                </div>
              ) : (
                <>
                  {logoSrc ? (
                    <img src={logoSrc} alt="Restaurant logo" className="w-10 h-10 rounded-md object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-orange-600 flex items-center justify-center text-white font-bold">
                      {restaurantName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex items-center">
                    <span className="font-extrabold text-xl tracking-tight">{restaurantName}</span>
                  </div>
                </>
              )}

              <div className="hidden md:flex space-x-4">
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                      isActivePath(item.path)
                        ? 'bg-orange-100 text-orange-700 shadow-sm ring-1 ring-orange-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-sm hidden md:inline text-gray-600">
                  {isConnected ? 'Live' : 'Reconnecting'}
                </span>
              </div>
              
              {/* Time */}
              <div className="hidden md:block text-sm text-gray-600">
                {currentTime.toLocaleTimeString()}
              </div>
              
              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 rounded-full border border-gray-200 bg-white px-2 py-1 shadow-sm focus:outline-none">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center shadow-sm">
                    {user?.name ? (
                      <span className="text-sm font-bold text-white">{user.name.charAt(0)}</span>
                    ) : (
                      <span className="text-sm font-bold text-white">C</span>
                    )}
                  </div>
                  <span className="hidden md:inline text-sm font-semibold text-gray-700">{user?.name || 'Chef'}</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl hidden group-hover:block z-50">
                  <div className="px-4 py-3 text-xs text-gray-500 border-b border-gray-100">
                    {user?.email}
                  </div>
                  <button
                    onClick={() => navigate('/chef/kitchen')}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-orange-50"
                  >
                    <Settings className="w-4 h-4 inline-block mr-2 text-orange-600" /> Profile Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 inline-block mr-2" /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banner intentionally removed for a cleaner kitchen header */}
      </nav>
      
      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex justify-around py-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center px-4 py-2 rounded-lg ${
                isActivePath(item.path) ? 'text-orange-600' : 'text-gray-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KitchenLayout;