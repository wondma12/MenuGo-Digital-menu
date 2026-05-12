// src/components/layout/KitchenLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import KitchenSoundNotification from '../kitchen/KitchenSoundNotification';
import { Activity, Check, User, Coffee, Settings, LogOut } from 'lucide-react'

const KitchenLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, isConnected } = useWebSocket();
  const [currentTime, setCurrentTime] = useState(new Date());

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const logoSrc = user?.restaurant?.logo || user?.restaurant?.logoUrl || user?.logo || null;
  const bannerSrc = user?.restaurant?.banner || user?.restaurant?.image || null;

  const menuItems = [
    { path: '/chef/kitchen', label: 'Active Orders', icon: <Activity className="w-5 h-5" /> },
    { path: '/chef/completed', label: 'Completed', icon: <Check className="w-5 h-5" /> },
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
    <div className="kitchen-layout min-h-screen bg-gray-100">
      <KitchenSoundNotification enabled={true} />
      
      {/* Top Navigation Bar (now white with dark text to match restaurant header) */}
      <nav className="bg-white text-black border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Restaurant logo (if available) */}
              {logoSrc ? (
                <img src={logoSrc} alt="Restaurant logo" className="w-10 h-10 rounded-md object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-md bg-orange-600 flex items-center justify-center text-white font-bold"><Coffee className="w-6 h-6" /></div>
              )}

              <div className="flex items-center space-x-2">
                <User className="w-6 h-6 text-gray-700" />
                <span className="font-bold text-xl">Kitchen Display</span>
              </div>

              <div className="hidden md:flex space-x-4">
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      isActivePath(item.path)
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-sm hidden md:inline">
                  {isConnected ? 'Live' : 'Reconnecting'}
                </span>
              </div>
              
              {/* Time */}
              <div className="hidden md:block text-sm">
                {currentTime.toLocaleTimeString()}
              </div>
              
              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {user?.name ? (
                      <span className="text-sm font-bold text-black">{user.name.charAt(0)}</span>
                    ) : (
                      <span className="text-sm font-bold">C</span>
                    )}
                  </div>
                  <span className="hidden md:inline text-sm">{user?.name || 'Chef'}</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-50">
                  <div className="px-4 py-2 text-xs text-gray-600 border-b">
                    {user?.email}
                  </div>
                  <button
                    onClick={() => navigate('/chef/kitchen')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 inline-block mr-2" /> Profile Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 inline-block mr-2" /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optional banner image below nav */}
        {bannerSrc && (
          <div className="w-full bg-white">
            <img src={bannerSrc} alt="Restaurant banner" className="w-full h-36 object-cover" />
          </div>
        )}
      </nav>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
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