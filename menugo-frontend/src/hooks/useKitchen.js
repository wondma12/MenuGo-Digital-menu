// src/hooks/useKitchen.js
import { useState, useEffect, useCallback } from 'react';
import kitchenService from '../services/kitchenService';

const toLocalDateString = (value) => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const useKitchen = (restaurantId) => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    if (!restaurantId) return;
    
    try {
      setLoading(true);
      const response = await kitchenService.getDashboard(restaurantId, { date: toLocalDateString(new Date()) });
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
    if (!restaurantId) {
      setLoading(false);
      setError('Missing restaurant ID');
      return;
    }

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  return { orders, stats, loading, error, updateOrderStatus, refresh: fetchDashboard };
};