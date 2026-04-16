import api from './api'
import { useAuthStore } from '../store/authStore'

const resolveRestaurantId = (restaurantId) => {
  if (!restaurantId) {
    const auth = useAuthStore.getState()
    const user = auth?.user
    return user?.restaurant_id || user?.restaurant?.id || null
  }
  if (typeof restaurantId === 'object') {
    return restaurantId?.id || restaurantId?.restaurant_id || null
  }
  return restaurantId
}

export const getCoupons = async (restaurantIdOrParams, params) => {
  let restaurantId = restaurantIdOrParams
  if (typeof restaurantIdOrParams === 'object' && !restaurantIdOrParams?.id && !restaurantIdOrParams?.restaurant_id) {
    params = restaurantIdOrParams
    restaurantId = undefined
  }
  const id = resolveRestaurantId(restaurantId)
  if (!id) return []
  const response = await api.get(`/coupons/restaurant/${id}`, { params })
  return response.data.data?.coupons || response.data.data || response.data
}

export const getCoupon = async (id) => {
  const response = await api.get(`/coupons/${id}`)
  return response.data.data || response.data
}

export const createCoupon = async (restaurantIdOrData, maybeData) => {
  let restaurantId = restaurantIdOrData
  let data = maybeData
  if (typeof restaurantIdOrData === 'object' && (restaurantIdOrData?.code || restaurantIdOrData?.discountValue)) {
    data = restaurantIdOrData
    restaurantId = undefined
  }
  const id = resolveRestaurantId(restaurantId)
  // Normalize payload to backend expectations (snake_case, ISO dates)
  const payload = {
    code: data.code,
    description: data.description,
    discount_type: data.discountType || data.discount_type,
    discount_value: data.discountValue ?? data.discount_value,
    minimum_order_amount: data.minimumOrderAmount ?? data.minimum_order_amount,
    max_discount_amount: data.maxDiscountAmount ?? data.max_discount_amount,
    usage_limit: data.usageLimit ?? data.usage_limit,
    per_user_limit: data.perUserLimit ?? data.per_user_limit,
    applicable_items: data.applicableItems ?? data.applicable_items ?? [],
    applicable_categories: data.applicableCategories ?? data.applicable_categories ?? [],
    start_date: data.startDate ? new Date(data.startDate).toISOString() : data.start_date,
    end_date: data.endDate ? new Date(data.endDate).toISOString() : data.end_date,
    is_active: data.isActive ?? data.is_active ?? true,
  }
  const response = await api.post(`/coupons/restaurant/${id}`, payload)
  return response.data.data || response.data
}

export const updateCoupon = async (idOrPayload, maybeData) => {
  let id = idOrPayload
  let data = maybeData
  if (typeof idOrPayload === 'object' && (idOrPayload.id || idOrPayload.couponId)) {
    id = idOrPayload.id || idOrPayload.couponId
    data = idOrPayload.data || idOrPayload
  }
  // Normalize update payload similarly
  const payload = {
    code: data.code,
    description: data.description,
    discount_type: data.discountType || data.discount_type,
    discount_value: data.discountValue ?? data.discount_value,
    minimum_order_amount: data.minimumOrderAmount ?? data.minimum_order_amount,
    max_discount_amount: data.maxDiscountAmount ?? data.max_discount_amount,
    usage_limit: data.usageLimit ?? data.usage_limit,
    per_user_limit: data.perUserLimit ?? data.per_user_limit,
    applicable_items: data.applicableItems ?? data.applicable_items,
    applicable_categories: data.applicableCategories ?? data.applicable_categories,
    start_date: data.startDate ? new Date(data.startDate).toISOString() : data.start_date,
    end_date: data.endDate ? new Date(data.endDate).toISOString() : data.end_date,
    is_active: data.isActive ?? data.is_active,
  }
  const response = await api.put(`/coupons/${id}`, payload)
  return response.data.data || response.data
}

export const deleteCoupon = async (id) => {
  const response = await api.delete(`/coupons/${id}`)
  return response.data.data || response.data
}

export const updateCouponStatus = async (id, isActive) => {
  const response = await api.put(`/coupons/${id}`, { is_active: isActive })
  return response.data.data || response.data
}

export const validateCoupon = async (code, restaurantId, orderAmount) => {
  // Some backend implementations expect restaurantId in params; keep in body for compatibility
  const id = resolveRestaurantId(restaurantId)
  const response = await api.post(`/coupons/validate`, { code, order_amount: orderAmount, restaurantId: id })
  return response.data.data || response.data
}

export const getCouponAnalytics = async (restaurantId) => {
  const id = resolveRestaurantId(restaurantId)
  if (!id) return { coupons: [], total_coupons: 0 }
  const response = await api.get(`/coupons/restaurant/${id}/analytics`)
  return response.data.data || response.data
}