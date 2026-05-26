import api from './api'

export const getOrders = async (restaurantId, params) => {
  const normalizedParams = { ...(params || {}) }
  if (normalizedParams.dateRange && typeof normalizedParams.dateRange === 'object') {
    normalizedParams.dateRange = JSON.stringify({
      start: normalizedParams.dateRange.start,
      end: normalizedParams.dateRange.end,
    })
  }

  const response = await api.get(`/orders/restaurant/${restaurantId}`, { params: normalizedParams })
  const payload = response?.data?.data || response?.data
  // Return the raw payload (may be an object with `orders` and metadata or an array)
  return payload || {}
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
  // Support both signatures: (id, status) and ({ id, status })
  let orderId = id
  let orderStatus = status
  if (typeof id === 'object' && id !== null) {
    orderId = id.id
    orderStatus = id.status
  }

  const response = await api.put(`/orders/${orderId}/status`, { status: orderStatus })
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
  // Support both signatures: (id, reason, notes) and ({ id, reason, notes })
  let orderId = id
  let r = reason
  let n = notes
  if (typeof id === 'object' && id !== null) {
    orderId = id.id
    r = id.reason
    n = id.notes
  }

  const payload = { status: 'rejected', notes: n || r }
  const response = await api.put(`/orders/${orderId}/status`, payload)
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
