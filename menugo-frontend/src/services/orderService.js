import api from './api'

export const getOrders = async (restaurantId, params) => {
  const response = await api.get(`/orders/restaurant/${restaurantId}`, { params })
  return response?.data?.data || response?.data || {}
}

export const getOrder = async (id) => {
  const response = await api.get(`/orders/${id}`)
  return response?.data?.data || response?.data || {}
}

export const getOrderDetails = async (id) => getOrder(id)

export const createOrder = async (data) => {
  const response = await api.post('/orders', data)
  return response?.data?.data || response?.data || {}
}

export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/orders/${id}/status`, { status })
  return response?.data?.data || response?.data || {}
}

export const cancelOrder = async (id, reason) => {
  const response = await api.post(`/orders/${id}/cancel`, { reason })
  return response?.data?.data || response?.data || {}
}

export const verifyOrder = async (id, method, code) => {
  // backend expects `verification_code` in the body
  const response = await api.post(`/orders/${id}/verify`, { method, verification_code: code })
  return response?.data?.data || response?.data || {}
}

export const rejectOrder = async (id, reason, notes) => {
  const response = await api.post(`/orders/${id}/reject`, { reason, notes })
  return response?.data?.data || response?.data || {}
}

export const getOrderStats = async (restaurantId, dateRange) => {
  const response = await api.get(`/reports/orders/${restaurantId}`, { params: dateRange })
  return response?.data?.data || response?.data || {}
}

export const getOrderHistory = async (userId) => {
  const response = await api.get(`/users/${userId}/orders`)
  return response?.data?.data || response?.data || {}
}
