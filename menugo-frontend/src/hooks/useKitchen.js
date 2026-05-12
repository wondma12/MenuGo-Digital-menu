// src/hooks/useKitchen.js
import { useState, useEffect, useCallback } from 'react';
import kitchenService from '../services/kitchenService';

export const useKitchen = (restaurantId) => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    if (!restaurantId) return;
    
    try {
      setLoading(true);
      const response = await kitchenService.getDashboard(restaurantId);
      const payload = response?.data?.data || response?.data || response || {};
      setOrders(payload.orders || []);
      setStats(payload.stats || {});
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch kitchen data');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await kitchenService.updateStatus(orderId, { status });
      await fetchDashboard();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update order status');
      throw err;
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  return { orders, stats, loading, error, updateOrderStatus, refresh: fetchDashboard };
};