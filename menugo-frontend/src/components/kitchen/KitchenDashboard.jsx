// src/components/kitchen/KitchenDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import KitchenStats from './KitchenStats';
import KitchenNotificationList from './KitchenNotificationList';
// Kitchen filters removed per request
import KitchenOrderList from './KitchenOrderList';
import KitchenCompletedOrders from './KitchenCompletedOrders';
import KitchenInventoryAlert from './KitchenInventoryAlert';

const KitchenDashboard = ({ restaurantId, orders, stats, onUpdateStatus, initialTab = 'pending' }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'pending');
  const navigate = useNavigate();
  const location = useLocation();

  // keep in sync with parent-driven initialTab changes (e.g., URL navigation)
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) setActiveTab(initialTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTab]);

  // Determine base path so we preserve /chef prefix when required
  const basePath = location.pathname && location.pathname.startsWith('/chef') ? '/chef/kitchen' : '/kitchen';

  const goToTab = (tab) => {
    // Completed has a dedicated route; other tabs use the main kitchen path with ?tab=
    if (tab === 'completed') {
      navigate(`${basePath}/completed`);
    } else {
      // Use query param for sub-tabs: ?tab=pending|preparing|ready
      const target = tab === 'pending' ? `${basePath}` : `${basePath}?tab=${tab}`;
      navigate(target);
    }
  };
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const completedOrders = orders.filter(o => o.status === 'completed');

  return (
    <div className="kitchen-dashboard min-h-screen bg-white text-gray-900">
      <KitchenInventoryAlert />
      <KitchenStats stats={stats} />
      {/* Notifications removed per request; notifications handled via sound/alerts */}
      
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Kitchen filters removed */}
        
        <div className="mb-8 overflow-x-auto rounded-2xl border border-orange-100 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-sm">
          <nav className="flex space-x-3 md:space-x-4 whitespace-nowrap">
            {['pending', 'preparing', 'ready', 'completed'].map(tab => (
              <button
                key={tab}
                onClick={() => goToTab(tab)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
                }`}
              >
                {tab.toUpperCase()} 
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-orange-50 text-orange-700'}`}>
                  {tab === 'pending' ? pendingOrders.length :
                   tab === 'preparing' ? preparingOrders.length :
                   tab === 'ready' ? readyOrders.length : (stats && typeof stats.completedToday !== 'undefined' ? stats.completedToday : completedOrders.length)}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'pending' && (
          <KitchenOrderList
            title="New Orders"
            orders={pendingOrders}
            type="pending"
            onUpdateStatus={onUpdateStatus}
          />
        )}
        
        {activeTab === 'preparing' && (
          <KitchenOrderList
            title="In Preparation"
            orders={preparingOrders}
            type="preparing"
            onUpdateStatus={onUpdateStatus}
          />
        )}
        
        {activeTab === 'ready' && (
          <KitchenOrderList
            title="Ready for Pickup"
            orders={readyOrders}
            type="ready"
            onUpdateStatus={onUpdateStatus}
          />
        )}
        
        {activeTab === 'completed' && (
          <KitchenCompletedOrders restaurantId={restaurantId} />
        )}
      </div>
    </div>
  );
};

export default KitchenDashboard;