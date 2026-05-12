import api from './api'

export const getWaiterCalls = async (params) => {
  const response = await api.get('/waiters/calls', { params })
  return response.data?.data ?? []
}

export const acknowledgeCall = async (callId) => {
  const response = await api.post(`/waiters/calls/${callId}/acknowledge`)
  return response.data
}

export const resolveCall = async (callId) => {
  const response = await api.post(`/waiters/calls/${callId}/resolve`)
  return response.data
}

// Customer-side: create a call request (public)
export const createCustomerCall = async (restaurantId, payload) => {
  const response = await api.post(`/restaurants/${restaurantId}/calls`, payload)
  return response?.data?.data || response?.data || {}
}
