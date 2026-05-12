// src/components/kitchen/KitchenInventoryAlert.jsx
import React, { useState, useEffect } from 'react';
import kitchenService from '../../services/kitchenService';
import { useAuth } from '../../hooks/useAuth';

const KitchenInventoryAlert = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (user?.restaurantId) {
      fetchAlerts();
    }
  }, [user]);

  const fetchAlerts = async () => {
    try {
      const response = await kitchenService.getInventoryAlerts(user.restaurantId);
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  if (alerts.length === 0 || !show) return null;

  const getAlertColor = (status) => {
    switch(status) {
      case 'out_of_stock': return 'bg-red-100 border-red-500 text-red-700';
      case 'critical': return 'bg-orange-100 border-orange-500 text-orange-700';
      default: return 'bg-yellow-100 border-yellow-500 text-yellow-700';
    }
  };

  const getAlertIcon = (status) => {
    switch(status) {
      case 'out_of_stock': return '🚫';
      case 'critical': return '⚠️';
      default: return '📉';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <div className="bg-white rounded-lg shadow-xl border overflow-hidden">
        <div className="bg-red-600 text-white px-4 py-2 flex justify-between items-center">
          <span className="font-semibold">Inventory Alerts</span>
          <button onClick={() => setShow(false)} className="text-white hover:text-gray-200">
            ✕
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-3 border-b ${getAlertColor(alert.status)}`}>
              <div className="flex items-start">
                <span className="text-xl mr-2">{getAlertIcon(alert.status)}</span>
                <div className="flex-1">
                  <div className="font-semibold">{alert.item_name}</div>
                  <div className="text-sm">
                    Stock: {alert.current_stock} / Threshold: {alert.threshold_level}
                  </div>
                  <div className="text-xs mt-1">
                    {alert.status === 'out_of_stock' ? 'Out of stock!' : 
                     alert.status === 'critical' ? 'Critical level!' : 
                     'Low stock warning'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KitchenInventoryAlert;