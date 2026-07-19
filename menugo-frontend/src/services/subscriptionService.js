// src/services/subscriptionService.js
import api from './api'
import { useAuthStore } from '../store/authStore'

// Empty defaults - plans should only come from API
const DEFAULT_SUBSCRIPTION_PLANS = []

const resolveRestaurantId = (restaurantId) => {
  if (restaurantId && typeof restaurantId === 'object') {
    return restaurantId.id || restaurantId.restaurant_id || restaurantId._id || restaurantId.restaurant?.id || restaurantId.restaurant?._id || null
  }

  if (typeof restaurantId === 'string' || typeof restaurantId === 'number') {
    return restaurantId
  }

  const authUser = useAuthStore.getState()?.user
  return authUser?.restaurant_id?.id || authUser?.restaurant_id || authUser?.restaurant?.id || authUser?.restaurant?._id || authUser?.restaurant?.restaurant_id || null
}

const getAuthRole = () => useAuthStore.getState()?.user?.role

// Get all subscription plans
export const getSubscriptionPlans = async () => {
  const response = await api.get('/platform/subscriptions/plans')
  const payload = response.data
  // Normalize responses: some APIs return { data: [...] } or { data: { plans: [...] } }
  if (payload?.data?.plans) return payload.data.plans
  if (payload?.data) return payload.data
  return payload || DEFAULT_SUBSCRIPTION_PLANS
}

export const getAvailablePlans = async () => getSubscriptionPlans()

// Get current subscription for restaurant
export const getCurrentSubscription = async (restaurantId) => {
  const resolvedRestaurantId = resolveRestaurantId(restaurantId)
  const authRole = getAuthRole()

  const endpoint = resolvedRestaurantId && authRole === 'platform_admin'
    ? `/platform/subscriptions/restaurant/${resolvedRestaurantId}`
    : '/platform/subscriptions/current'

  try {
    const response = await api.get(endpoint)
    const payload = response?.data?.data || response?.data || {}

    return {
      ...payload,
      tier: payload.tier || payload.subscription_tier || payload.current_subscription?.tier,
      name: payload.name || payload.plan_name || payload.current_subscription?.name || payload.current_subscription?.tier,
      billingCycle: payload.billingCycle || payload.billing_cycle || payload.subscription_tier || payload.current_subscription?.billing_cycle || payload.current_subscription?.tier,
      price: payload.price || payload.price_monthly || payload.current_subscription?.price_monthly || payload.current_subscription?.price || 0,
      nextBillingDate: payload.nextBillingDate || payload.next_billing_date || payload.subscription_end_date || payload.current_subscription?.next_billing_date || payload.current_subscription?.subscription_end_date || null,
    }
  } catch (error) {
    const restaurant = useAuthStore.getState()?.user?.restaurant || {}
    return {
      tier: restaurant.subscription_tier || restaurant.subscriptionTier || 'monthly',
      name: restaurant.subscription_name || restaurant.subscriptionName || restaurant.subscription_tier || 'Monthly Plan',
      billingCycle: restaurant.billing_cycle || restaurant.billingCycle || 'monthly',
      price: restaurant.price_monthly || restaurant.priceMonthly || 0,
      nextBillingDate: restaurant.next_billing_date || restaurant.nextBillingDate || restaurant.subscription_end_date || restaurant.subscriptionEndDate || null,
    }
  }
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
  const resolvedRestaurantId = resolveRestaurantId(restaurantId)
  if (!resolvedRestaurantId) {
    return {}
  }

  // Non-platform admins should avoid the platform-only endpoint.
  if (getAuthRole() && getAuthRole() !== 'platform_admin') {
    const restaurant = useAuthStore.getState()?.user?.restaurant || {}
    return {
      current_subscription: null,
      subscription_tier: restaurant.subscription_tier || restaurant.subscriptionTier || 'monthly',
      subscription_status: restaurant.subscription_status || restaurant.subscriptionStatus || 'active',
      subscription_end_date: restaurant.subscription_end_date || restaurant.subscriptionEndDate || null,
    }
  }

  const response = await api.get(`/platform/subscriptions/restaurant/${resolvedRestaurantId}`)
  return response?.data?.data || response?.data || {}
}

// Legacy/Backward compatibility aliases
export const getPlans = getSubscriptionPlans
export const getAllSubscriptions = getSubscriptions