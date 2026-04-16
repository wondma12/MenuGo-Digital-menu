import api from './api'

export const getTables = async (restaurantId, params) => {
  const response = await api.get(`/restaurants/${restaurantId}/tables`, { params })
  return response?.data?.data || response?.data || []
}

export const getTable = async (id) => {
  const response = await api.get(`/tables/${id}`)
  return response.data
}

export const createTable = async (restaurantId, data) => {
  const response = await api.post(`/restaurants/${restaurantId}/tables`, data)
  return response?.data?.data || response?.data || {}
}

export const updateTable = async (id, data) => {
  const response = await api.put(`/tables/${id}`, data)
  return response?.data?.data || response?.data || {}
}

export const deleteTable = async (id) => {
  const response = await api.delete(`/tables/${id}`)
  return response.data
}

export const updateTableStatus = async (id, status) => {
  const response = await api.patch(`/tables/${id}/status`, { status })
  return response.data
}

export const assignTableToWaiter = async (tableId, waiterId, reason) => {
  const response = await api.post(`/tables/${tableId}/assign`, { waiterId, reason })
  return response.data
}

export const transferTable = async (tableId, fromWaiterId, toWaiterId, reason) => {
  const response = await api.post(`/tables/${tableId}/transfer`, { fromWaiterId, toWaiterId, reason })
  return response.data
}

export const getTableQRCode = async (id) => {
  // Fetch table to determine restaurant id, then request the restaurant-level QR for the table
  const tableResp = await api.get(`/tables/${id}`)
  const table = tableResp?.data?.data || tableResp?.data || {}
  const restaurantId = table.restaurant_id || table.restaurantId || (table.restaurant && table.restaurant.id)
  if (!restaurantId) throw new Error('Restaurant id not found for table')

  const response = await api.post(`/qr/restaurant/${restaurantId}/table/${id}/generate`)
  return response?.data?.data || response?.data || {}
}

export const regenerateQRCode = async (id) => {
  const response = await api.post(`/tables/${id}/qrcode/regenerate`)
  return response.data
}

export const getAvailableWaiters = async () => {
  const response = await api.get('/waiters/available')
  return response.data
}