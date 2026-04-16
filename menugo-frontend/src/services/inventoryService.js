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

export const getInventoryItems = async (restaurantId, params) => {
  const id = resolveRestaurantId(restaurantId)
  const response = await api.get(`/inventory/restaurant/${id}`, { params })
  return response.data.data || response.data
}

export const getInventory = async (params = {}) => {
  const id = resolveRestaurantId(params.restaurantId)
  const query = { ...params }
  delete query.restaurantId
  if (!id) return []
  const response = await api.get(`/inventory/restaurant/${id}`, { params: query })
  return response.data.data?.items || response.data.data || response.data
}

export const getInventoryItem = async (id) => {
  const response = await api.get(`/inventory/${id}`)
  return response.data.data || response.data
}

export const createInventoryItem = async (restaurantIdOrData, maybeData) => {
  let restaurantId = restaurantIdOrData
  let data = maybeData
  // If caller passed only data (from forms), detect it and shift args
  if (typeof restaurantIdOrData === 'object' && (restaurantIdOrData?.name || restaurantIdOrData?.quantity || restaurantIdOrData?.unit)) {
    data = restaurantIdOrData
    restaurantId = undefined
  }
  const id = resolveRestaurantId(restaurantId)
  const response = await api.post(`/inventory/restaurant/${id}`, data)
  return response.data.data || response.data
}

export const updateInventoryItem = async (idOrPayload, maybeData) => {
  let id = idOrPayload
  let data = maybeData
  if (typeof idOrPayload === 'object' && (idOrPayload.id || idOrPayload.itemId)) {
    id = idOrPayload.id || idOrPayload.itemId
    data = idOrPayload.data || idOrPayload
  }
  const response = await api.put(`/inventory/${id}`, data)
  return response.data.data || response.data
}

export const deleteInventoryItem = async (id) => {
  const response = await api.delete(`/inventory/${id}`)
  return response.data.data || response.data
}

export const adjustStock = async (idOrPayload, maybeQuantity, maybeReason, maybeType = 'adjustment') => {
  let id = idOrPayload
  let quantity = maybeQuantity
  let reason = maybeReason
  let transaction_type = maybeType

  if (typeof idOrPayload === 'object') {
    id = idOrPayload.itemId || idOrPayload.id || idOrPayload.inventory_item_id
    quantity = idOrPayload.quantity
    reason = idOrPayload.reason || idOrPayload.notes
    transaction_type = idOrPayload.transaction_type || idOrPayload.type || 'adjustment'
  }

  const response = await api.post(`/inventory/${id}/adjust`, { quantity, transaction_type, notes: reason })
  return response.data.data || response.data
}

export const getLowStockItems = async (restaurantIdOrParams) => {
  let restaurantId = restaurantIdOrParams
  if (typeof restaurantIdOrParams === 'object' && !restaurantIdOrParams?.id && !restaurantIdOrParams?.restaurant_id && !restaurantIdOrParams?.restaurantId) {
    restaurantId = undefined
  }
  const id = resolveRestaurantId(restaurantId)
  if (!id) return []
  const response = await api.get(`/inventory/restaurant/${id}/low-stock`)
  return response.data.data || response.data
}

export const getInventoryTransactions = async (restaurantIdOrParams, maybeParams) => {
  let params = maybeParams
  let restaurantId = restaurantIdOrParams
  if (typeof restaurantIdOrParams === 'object' && !restaurantIdOrParams?.id && !restaurantIdOrParams?.restaurant_id && !restaurantIdOrParams?.restaurantId) {
    params = restaurantIdOrParams
    restaurantId = undefined
  }
  const id = resolveRestaurantId(restaurantId)
  if (!id) return { transactions: [], total: 0, page: 1, totalPages: 0 }
  const response = await api.get(`/inventory/restaurant/${id}/transactions`, { params })
  return response.data.data || response.data
}
