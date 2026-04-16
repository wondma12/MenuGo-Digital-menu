import api from './api'

export const getCategories = async (restaurantId) => {
  const response = await api.get(`/menu/categories/${restaurantId}`)
  const raw = response.data?.data || []
  // Normalize icon property for frontend components
  const mapped = Array.isArray(raw)
    ? raw.map(c => ({ ...c, icon: c.icon || c.icon_url || c.image_url || null }))
    : raw
  return mapped
}

export const getCategory = async (id) => {
  const response = await api.get(`/menu/categories/${id}`)
  const raw = response.data?.data || null
  if (!raw) return raw
  return { ...raw, icon: raw.icon || raw.icon_url || raw.image_url || null }
}

export const createCategory = async (restaurantId, data) => {
  const response = await api.post(`/menu/categories/${restaurantId}`, data)
  const raw = response.data?.data || null
  if (!raw) return raw
  return { ...raw, icon: raw.icon || raw.icon_url || raw.image_url || null }
}

export const updateCategory = async (id, data) => {
  const response = await api.put(`/menu/categories/${id}`, data)
  const raw = response.data?.data || null
  if (!raw) return raw
  return { ...raw, icon: raw.icon || raw.icon_url || raw.image_url || null }
}

export const deleteCategory = async (id) => {
  const response = await api.delete(`/menu/categories/${id}`)
  return response.data.data
}

export const updateCategoryStatus = async (id, isActive) => {
  const response = await api.patch(`/menu/categories/${id}/status`, { isActive })
  return response.data.data
}

export const updateCategoryOrder = async (orderData) => {
  const response = await api.put('/menu/categories/order', { order: orderData })
  return response.data.data
}