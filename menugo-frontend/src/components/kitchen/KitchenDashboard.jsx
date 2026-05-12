// src/components/kitchen/KitchenDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import KitchenStats from './KitchenStats';
import KitchenNotificationList from './KitchenNotificationList';
import KitchenFilters from './KitchenFilters';
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
  const [filter, setFilter] = useState({ search: '', station: 'all' });

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const filterOrders = (orderList) => {
    return orderList.filter(order => {
      if (filter.search && !order.orderNumber.includes(filter.search)) return false;
      if (filter.station !== 'all' && order.station !== filter.station) return false;
      return true;
    });
  };

  return (
    <div className="kitchen-dashboard min-h-screen bg-gray-50">
      <KitchenInventoryAlert />
      <KitchenStats stats={stats} />
      {/* Notifications removed per request; notifications handled via sound/alerts */}
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <KitchenFilters filter={filter} onFilterChange={setFilter} />
        
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {['pending', 'preparing', 'ready', 'completed'].map(tab => (
              <button
                key={tab}
                onClick={() => goToTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.toUpperCase()} 
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200">
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
            orders={filterOrders(pendingOrders)}
            type="pending"
            onUpdateStatus={onUpdateStatus}
          />
        )}
        
        {activeTab === 'preparing' && (
          <KitchenOrderList
            title="In Preparation"
            orders={filterOrders(preparingOrders)}
            type="preparing"
            onUpdateStatus={onUpdateStatus}
          />
        )}
        
        {activeTab === 'ready' && (
          <KitchenOrderList
            title="Ready for Pickup"
            orders={filterOrders(readyOrders)}
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