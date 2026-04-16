import api from './api'

const transformMenuItem = (raw) => {
  if (!raw) return raw
  const categoryObj = raw.category || null
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    price: raw.price ? Number(raw.price) : raw.price,
    discountPrice: raw.discount_price ?? raw.discountPrice,
    cost: raw.cost ?? null,
    image: raw.image_url || raw.image || raw.imageUrl || null,
    imageUrl: raw.image_url || raw.imageUrl || null,
    thumbnailUrl: raw.thumbnail_url || raw.thumbnailUrl || null,
    isAvailable: raw.is_available ?? raw.isAvailable ?? true,
    isRecommended: raw.is_recommended ?? raw.isRecommended ?? false,
    isPopular: raw.is_popular ?? raw.isPopular ?? false,
    isNew: raw.is_new ?? raw.isNew ?? false,
    isVegetarian: raw.is_vegetarian ?? raw.isVegetarian ?? false,
    isVegan: raw.is_vegan ?? raw.isVegan ?? false,
    isGlutenFree: raw.is_gluten_free ?? raw.isGlutenFree ?? false,
    isHalal: raw.is_halal ?? raw.isHalal ?? false,
    spiceLevel: raw.spice_level ?? raw.spiceLevel ?? 0,
    preparationTime: raw.preparation_time ?? raw.preparationTime ?? 0,
    calories: raw.calories ?? null,
    servingSize: raw.serving_size ?? raw.servingSize ?? null,
    allergens: raw.allergens || raw.allergen || [],
    tags: raw.tags || [],
    displayOrder: raw.display_order ?? raw.displayOrder ?? 0,
    stockQuantity: raw.stock_quantity ?? raw.stockQuantity ?? null,
    lowStockThreshold: raw.low_stock_threshold ?? raw.lowStockThreshold ?? null,
    salesCount: raw.sales_count ?? raw.salesCount ?? 0,
    rating: raw.rating ?? null,
    reviewCount: raw.review_count ?? raw.reviewCount ?? 0,
    categoryId: raw.category_id ?? raw.categoryId ?? categoryObj?.id ?? null,
    category: (categoryObj && (categoryObj.name || categoryObj.title)) || (raw.category && raw.category.name) || null,
    createdAt: raw.created_at || raw.createdAt || null,
    updatedAt: raw.updated_at || raw.updatedAt || null,
  }
}

export const getMenuItems = async (restaurantId, params) => {
  const response = await api.get(`/menu/items/${restaurantId}`, { params })
  const raw = response.data?.data || response.data || []
  const items = Array.isArray(raw) ? raw.map(transformMenuItem) : (raw.items || []).map(transformMenuItem)
  return { items }
}

export const getMenuItem = async (id) => {
  const response = await api.get(`/menu/item/${id}`)
  const raw = response.data?.data || response.data
  return transformMenuItem(raw)
}

export const createMenuItem = async (restaurantId, data) => {
  const response = await api.post(`/menu/items/${restaurantId}`, data)
  const raw = response.data?.data || response.data
  return transformMenuItem(raw)
}

export const updateMenuItem = async (id, data) => {
  const response = await api.put(`/menu/items/${id}`, data)
  const raw = response.data?.data || response.data
  return transformMenuItem(raw)
}

export const deleteMenuItem = async (id) => {
  const response = await api.delete(`/menu/items/${id}`)
  return response.data?.data || response.data
}

export const updateMenuItemAvailability = async (id, isAvailable) => {
  const response = await api.patch(`/menu/items/${id}/toggle`, { isAvailable })
  const raw = response.data?.data || response.data
  return transformMenuItem(raw)
}

export const bulkUpdateMenuItems = async (ids, data) => {
  const response = await api.patch('/menu/bulk', { ids, ...data })
  const raw = response.data?.data || response.data
  if (Array.isArray(raw)) return raw.map(transformMenuItem)
  return raw
}

export const bulkDeleteMenuItems = async (ids) => {
  const response = await api.delete('/menu/bulk', { data: { ids } })
  return response.data?.data || response.data
}

export const importMenuItems = async (formData) => {
  const response = await api.post('/menu/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  const raw = response.data?.data || response.data
  return raw
}

export const exportMenuItems = async (format) => {
  const response = await api.get(`/menu/export`, { params: { format }, responseType: 'blob' })
  return response.data
}

export const downloadTemplate = async () => {
  const response = await api.get('/menu/template', { responseType: 'blob' })
  return response.data
}

export const getRestaurantMenu = async (restaurantId) => {
  const response = await api.get(`/menu/restaurant/${restaurantId}`)
  const raw = response.data?.data || response.data || {}
  const categories = raw.categories || []
  const items = (raw.items || []).map(transformMenuItem)
  return { restaurant: raw.restaurant, categories, items }
}