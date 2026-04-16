// src/services/subscriptionService.js
import api from './api'

// Get all subscription plans
export const getSubscriptionPlans = async () => {
  const response = await api.get('/platform/subscriptions/plans')
  const payload = response.data
  // Normalize responses: some APIs return { data: [...] } or { data: { plans: [...] } }
  if (payload?.data?.plans) return payload.data.plans
  if (payload?.data) return payload.data
  return payload
}

export const getAvailablePlans = async () => getSubscriptionPlans()

// Get current subscription for restaurant
export const getCurrentSubscription = async (restaurantId) => {
  const response = await api.get(`/platform/subscriptions/restaurant/${restaurantId}`)
  return response?.data?.data || response?.data || {}
}

// Create subscription for restaurant
export const createSubscription = async (data) => {
  const response = await api.post('/platform/subscriptions/create', data)
  return response?.data?.data || response?.data || {}
}

// Create subscription plan (admin only)
export const createPlan = async (data) => {
  const response = await api.post('/platform/subscriptions/plans/create', data)
  return response?.data?.data || response?.data || {}
}

// Cancel subscription
export const cancelSubscription = async (id, reason) => {
  const response = await api.delete(`/platform/subscriptions/${id}/cancel`, { data: { reason } })
  return response?.data?.data || response?.data || {}
}

// Update subscription
export const updateSubscription = async (id, data) => {
  const response = await api.put(`/platform/subscriptions/${id}`, data)
  return response?.data?.data || response?.data || {}
}

// Update subscription plan (admin only)
export const updatePlan = async ({ id, data }) => {
  const response = await api.put(`/platform/subscriptions/plans/${id}`, data)
  return response?.data?.data || response?.data || {}
}

// Delete subscription plan (admin only)
export const deletePlan = async (id) => {
  const response = await api.delete(`/platform/subscriptions/plans/${id}`)
  return response?.data?.data || response?.data || {}
}

// Get invoices (if you have this endpoint)
export const getInvoices = async (params) => {
  const response = await api.get('/platform/subscriptions/invoices', { params })
  return response?.data?.data || response?.data || {}
}

// Download invoice (if you have this endpoint)
export const downloadInvoice = async (invoiceId) => {
  const response = await api.get(`/platform/subscriptions/invoices/${invoiceId}/download`, {
    responseType: 'blob',
  })
  return response.data
}

// Get revenue report (admin only)
export const getRevenueReport = async (dateRange) => {
  const response = await api.get('/platform/subscriptions/revenue/report', { params: dateRange })
  return response?.data?.data || response?.data || {}
}

// Get all subscriptions (admin only)
export const getSubscriptions = async (params) => {
  const response = await api.get('/platform/subscriptions', { params })
  return response?.data?.data || response?.data || {}
}

// Get subscription by ID (admin only)
export const getSubscriptionById = async (id) => {
  const response = await api.get(`/platform/subscriptions/${id}`)
  return response?.data?.data || response?.data || {}
}

// Get restaurant subscription details
export const getRestaurantSubscription = async (restaurantId) => {
  const response = await api.get(`/platform/subscriptions/restaurant/${restaurantId}`)
  return response?.data?.data || response?.data || {}
}

// Legacy/Backward compatibility aliases
export const getPlans = getSubscriptionPlans
export const getAllSubscriptions = getSubscriptions