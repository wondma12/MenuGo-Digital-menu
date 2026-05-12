// src/services/kitchenService.js
import api from './api';

const kitchenService = {
  getDashboard: (restaurantId) => api.get(`/kitchen/dashboard/${restaurantId}`),
  updateStatus: (orderId, data) => api.put(`/kitchen/orders/${orderId}/status`, data),
  getOrderDetails: (orderId) => api.get(`/kitchen/orders/${orderId}`),
  bulkUpdate: (data) => api.post('/kitchen/orders/bulk-update', data),
  getCompletedOrders: (restaurantId, params) => {
    const safeParams = { ...(params || {}), _t: Date.now() };
    return api.get(`/kitchen/completed/${restaurantId}`, { params: safeParams });
  },
  getAnalytics: (restaurantId, params) => api.get(`/kitchen/analytics/${restaurantId}`, { params }),
  getInventoryAlerts: (restaurantId) => api.get(`/kitchen/inventory-alerts/${restaurantId}`),
};

export default kitchenService;