import api from './api'
import { useAuthStore } from '../store/authStore'

export const getWaiters = async (restaurantId, params) => {
  const response = await api.get(`/restaurants/${restaurantId}/waiters`, { params })
  return response?.data?.data ?? response.data
}

export const getWaiter = async (id) => {
  const response = await api.get(`/waiters/${id}`)
  return response?.data?.data ?? response.data
}

export const createWaiter = async (restaurantId, data) => {
  const response = await api.post(`/restaurants/${restaurantId}/waiters`, data)
  return response?.data?.data ?? response.data
}

export const updateWaiter = async (id, data) => {
  const response = await api.put(`/waiters/${id}`, data)
  return response?.data?.data ?? response.data
}

export const deleteWaiter = async (id) => {
  const response = await api.delete(`/waiters/${id}`)
  return response?.data?.data ?? response.data
}

export const updateWaiterStatus = async (id, isActive) => {
  const response = await api.patch(`/waiters/${id}/status`, { isActive })
  return response?.data?.data ?? response.data
}

export const getWaiterSchedule = async (id, dateRange) => {
  const response = await api.get(`/waiters/${id}/schedule`, { params: dateRange })
  return response?.data?.data ?? response.data
}

export const updateWaiterSchedule = async (id, schedule) => {
  const response = await api.put(`/waiters/${id}/schedule`, schedule)
  return response?.data?.data ?? response.data
}

export const getWaiterPerformance = async (id, dateRange) => {
  const response = await api.get(`/waiters/${id}/performance`, { params: dateRange })
  return response?.data?.data ?? response.data
}

export const getWaiterDashboard = async () => {
  const response = await api.get('/waiters/dashboard')
  return response?.data?.data ?? response.data
}

export const getWaiterOrders = async (params) => {
  // Backend exposes waiter-specific orders under /orders/waiter/orders
  const response = await api.get('/orders/waiter/orders', { params })
  return response?.data?.data ?? response.data
}
export const getWaiterTables = async () => {
  // Try to resolve restaurant id from auth store first
  let restaurantId = useAuthStore.getState()?.user?.restaurant_id || useAuthStore.getState()?.user?.restaurant?.id

  // Fallback: try to get waiter profile which includes restaurant info
  if (!restaurantId) {
    try {
      const profileResp = await api.get('/waiters/profile')
      const waiter = profileResp?.data?.data || profileResp?.data || null
      restaurantId = waiter?.restaurant_id || waiter?.restaurant?.id || null
    } catch (err) {
      console.error('getWaiterTables: unable to fetch waiter profile', err)
    }
  }

  if (!restaurantId) {
    console.error('getWaiterTables: no restaurant id available')
    return []
  }

  try {
    const response = await api.get(`/tables/restaurant/${restaurantId}`)
    return response?.data?.data ?? response.data ?? []
  } catch (err) {
    console.error('getWaiterTables: failed to fetch tables', err)
    return []
  }
}

export const getWaiterProfile = async () => {
  const response = await api.get('/waiters/profile')
  return response?.data?.data ?? response.data
}

export const updateWaiterProfile = async (data) => {
  const response = await api.put('/waiters/profile', data)
  return response?.data?.data ?? response.data
}

export const changeWaiterPassword = async (data) => {
  const response = await api.post('/waiters/change-password', data)
  return response?.data?.data ?? response.data
}

export const updateWaiterAvailability = async (availability) => {
  const response = await api.put('/waiters/availability', availability)
  return response?.data?.data ?? response.data
}

export const createOrderAsWaiter = async (data) => {
  const response = await api.post('/orders/waiter', data)
  return response?.data?.data ?? response.data
}

export const createCallRequest = async (restaurantId, data) => {
  const response = await api.post(`/restaurants/${restaurantId}/calls`, data)
  return response?.data?.data ?? response.data
}