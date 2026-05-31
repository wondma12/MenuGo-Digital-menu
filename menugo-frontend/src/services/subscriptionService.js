// src/services/subscriptionService.js
import api from './api'
import { useAuthStore } from '../store/authStore'

const DEFAULT_SUBSCRIPTION_PLANS = [
  {
    id: 'plan_basic',
    tier: 'basic',
    name: 'Basic Plan',
    description: 'Essential features for small restaurants',
    price_monthly: 0,
    price_yearly: 0,
    features: ['Digital menu', 'QR ordering', 'Basic analytics', 'Up to 50 menu items'],
    limits: { menu_items: 50, staff_accounts: 5, orders_per_day: 100 },
    is_active: true,
  },
  {
    id: 'plan_premium',
    tier: 'premium',
    name: 'Premium Plan',
    description: 'Advanced tools for growing businesses',
    price_monthly: 29,
    price_yearly: 290,
    features: ['Everything in Basic', 'Priority support', 'Inventory tracking', 'Advanced analytics'],
    limits: { menu_items: 200, staff_accounts: 15, orders_per_day: 500 },
    is_active: true,
  },
  {
    id: 'plan_enterprise',
    tier: 'enterprise',
    name: 'Enterprise Plan',
    description: 'Full platform access and customization',
    price_monthly: 99,
    price_yearly: 990,
    features: ['Everything in Premium', 'Dedicated support', 'Custom integrations', 'Unlimited everything'],
    limits: { menu_items: -1, staff_accounts: -1, orders_per_day: -1 },
    is_active: true,
  },
]

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
  // Restaurant admins should not hit the platform-only plans endpoint.
  if (getAuthRole() && getAuthRole() !== 'platform_admin') {
    return DEFAULT_SUBSCRIPTION_PLANS
  }

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

  // If no restaurant context is available, return a safe default so the UI renders.
  if (!resolvedRestaurantId) {
    const restaurant = useAuthStore.getState()?.user?.restaurant || {}
    return {
      tier: restaurant.subscription_tier || restaurant.subscriptionTier || 'basic',
      name: restaurant.subscription_name || restaurant.subscriptionName || 'Basic Plan',
      billingCycle: restaurant.billing_cycle || restaurant.billingCycle || 'monthly',
      price: restaurant.price_monthly || restaurant.priceMonthly || 0,
      nextBillingDate: restaurant.next_billing_date || restaurant.nextBillingDate || null,
    }
  }

  // Restaurant admins should not call the platform-admin-only subscription route.
  if (getAuthRole() && getAuthRole() !== 'platform_admin') {
    const restaurant = useAuthStore.getState()?.user?.restaurant || {}
    return {
      tier: restaurant.subscription_tier || restaurant.subscriptionTier || 'basic',
      name: restaurant.subscription_name || restaurant.subscriptionName || 'Basic Plan',
      billingCycle: restaurant.billing_cycle || restaurant.billingCycle || 'monthly',
      price: restaurant.price_monthly || restaurant.priceMonthly || 0,
      nextBillingDate: restaurant.next_billing_date || restaurant.nextBillingDate || null,
    }
  }

  const response = await api.get(`/platform/subscriptions/restaurant/${resolvedRestaurantId}`)
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
  const resolvedRestaurantId = resolveRestaurantId(restaurantId)
  if (!resolvedRestaurantId) {
    return {}
  }

  // Non-platform admins should avoid the platform-only endpoint.
  if (getAuthRole() && getAuthRole() !== 'platform_admin') {
    const restaurant = useAuthStore.getState()?.user?.restaurant || {}
    return {
      current_subscription: null,
      subscription_tier: restaurant.subscription_tier || restaurant.subscriptionTier || 'basic',
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