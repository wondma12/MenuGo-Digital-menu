// src/services/restaurantService.js
import api from './api'
import { useAuthStore } from '../store/authStore'

export const getRestaurants = async (params) => {
  const response = await api.get('/restaurants', { params })
  
  // Unwrap the response to match what the component expects
  const payload = response?.data?.data || response?.data || {}
  
  // Return the data in the format expected by RestaurantList component
  return {
    restaurants: payload.restaurants || [],
    total: payload.total || 0,
    active: payload.active || 0,
    pending: payload.pending || 0,
    premium: payload.premium || 0,
    page: payload.page || 1,
    totalPages: payload.totalPages || 1,
  }
}

// export const getRestaurantDetails = async (id) => {
//   const response = await api.get(`/restaurants/${id}`)

//   // Unwrap ApiResponse if present and normalize keys to what components expect
//   const payload = response?.data?.data || response?.data || {}
//   const r = payload

//   const normalized = {
//     ...r,
//     id: r.id,
//     name: r.name,
//     description: r.description,
//     address: r.address,
//     city: r.city,
//     state: r.state,
//     country: r.country,
//     postal_code: r.postal_code,
//     latitude: r.latitude,
//     longitude: r.longitude,
//     phone: r.phone,
//     email: r.email,
//     website: r.website,
//     coverImage: r.cover_image_url || r.coverImage || null,
//     cover_image_url: r.cover_image_url || null,
//     logo: r.logo_url || r.logo || null,
//     logo_url: r.logo_url || null,
//     cuisine_type: r.cuisine_type,
//     cuisine_types: r.cuisine_types || [],
//     operating_hours: r.operating_hours || {},
//     isVerified: r.is_verified ?? r.isVerified ?? false,
//     is_verified: r.is_verified ?? false,
//     isActive: r.is_active ?? r.isActive ?? true,
//     is_active: r.is_active ?? true,
//     subscriptionTier: r.subscription_tier || r.subscriptionTier || 'basic',
//     subscription_tier: r.subscription_tier || 'basic',
//     subscriptionStatus: r.subscription_status || r.subscriptionStatus || null,
//     subscription_status: r.subscription_status || null,
//     subscriptionStartDate: r.subscription_start_date || r.subscriptionStartDate || null,
//     subscription_end_date: r.subscription_end_date || null,
//     subscriptionEndDate: r.subscription_end_date || null,
//     totalOrders: r.total_orders || r.totalOrders || 0,
//     totalRevenue: r.total_revenue || r.totalRevenue || 0,
//     menuItems: r.menu_items || r.menuItems || [],
//     total_menu_items: r.total_menu_items || 0,
//     totalStaff: r.total_staff || r.totalStaff || 0,
//     average_rating: r.average_rating || 0,
//     total_reviews: r.total_reviews || 0,
//     owner: r.owner || null,
//     staff: r.staff || [],
//     tables: r.tables || [],
//     categories: r.categories || [],
//     created_at: r.created_at,
//     updated_at: r.updated_at,
//   }

//   return normalized
// }

export const getRestaurantSettings = async () => {
  // Try to determine restaurant id from auth store
  const authState = useAuthStore.getState()
  const restaurantId = authState?.user?.restaurant_id || authState?.user?.restaurant?.id || authState?.user?.restaurant?._id

  if (!restaurantId) {
    console.error('getRestaurantSettings: no restaurant id available in auth store')
    return {}
  }

  const response = await api.get(`/restaurants/${restaurantId}`)
  // Normalize keys to frontend-friendly camelCase where useful
  const payload = response?.data?.data || response?.data || {}
  const r = payload

  const normalized = {
    ...r,
    coverImage: r.cover_image_url || r.coverImage || null,
    coverImageUrl: r.cover_image_url || r.coverImage || null,
    logo: r.logo_url || r.logo || null,
    logoUrl: r.logo_url || r.logo || null,
    operatingHours: r.operating_hours || r.operatingHours || {},
    postalCode: r.postal_code || r.postalCode || null,
  }

  return normalized
}

export const createRestaurant = async (data) => {
  const response = await api.post('/restaurants', data)
  return response?.data?.data || response?.data || {}
}

// src/services/restaurantService.js

export const updateRestaurant = async (id, data) => {
  // Ensure id is a string, not an object
  const restaurantId = typeof id === 'object' ? id.id || id._id : id;
  
  if (!restaurantId || restaurantId === '[object Object]') {
    console.error('Invalid restaurant ID:', id);
    throw new Error('Invalid restaurant ID');
  }
  
  const response = await api.put(`/restaurants/${restaurantId}`, data);
  return response?.data?.data || response?.data || {};
};

export const getRestaurantDetails = async (id) => {
  // Ensure id is a string
  const restaurantId = typeof id === 'object' ? id.id || id._id : id;
  
  if (!restaurantId || restaurantId === '[object Object]') {
    console.error('Invalid restaurant ID:', id);
    throw new Error('Invalid restaurant ID');
  }
  
  const response = await api.get(`/restaurants/${restaurantId}`);
  
  // Unwrap ApiResponse if present and normalize keys to what components expect
  const payload = response?.data?.data || response?.data || {};
  const r = payload;

  const normalized = {
    ...r,
    id: r.id,
    name: r.name,
    description: r.description,
    address: r.address,
    city: r.city,
    state: r.state,
    country: r.country,
    postal_code: r.postal_code,
    latitude: r.latitude,
    longitude: r.longitude,
    phone: r.phone,
    email: r.email,
    website: r.website,
    coverImage: r.cover_image_url || r.coverImage || null,
    cover_image_url: r.cover_image_url || null,
    logo: r.logo_url || r.logo || null,
    logo_url: r.logo_url || null,
    cuisine_type: r.cuisine_type,
    cuisine_types: r.cuisine_types || [],
    operating_hours: r.operating_hours || {},
    isVerified: r.is_verified ?? r.isVerified ?? false,
    is_verified: r.is_verified ?? false,
    isActive: r.is_active ?? r.isActive ?? true,
    is_active: r.is_active ?? true,
    subscriptionTier: r.subscription_tier || r.subscriptionTier || 'basic',
    subscription_tier: r.subscription_tier || 'basic',
    subscriptionStatus: r.subscription_status || r.subscriptionStatus || null,
    subscription_status: r.subscription_status || null,
    subscriptionStartDate: r.subscription_start_date || r.subscriptionStartDate || null,
    subscription_end_date: r.subscription_end_date || null,
    subscriptionEndDate: r.subscription_end_date || null,
    totalOrders: r.total_orders || r.totalOrders || 0,
    totalRevenue: r.total_revenue || r.totalRevenue || 0,
    menuItems: r.menu_items || r.menuItems || [],
    total_menu_items: r.total_menu_items || 0,
    totalStaff: r.total_staff || r.totalStaff || 0,
    average_rating: r.average_rating || 0,
    total_reviews: r.total_reviews || 0,
    owner: r.owner || null,
    staff: r.staff || [],
    tables: r.tables || [],
    categories: r.categories || [],
    created_at: r.created_at,
    updated_at: r.updated_at,
  };

  return normalized;
};

export const updateRestaurantProfile = async (data) => {
  // Determine restaurant id (allow caller to pass restaurant_id in data)
  const restaurantId = data?.restaurant_id || data?.restaurantId || data?.id || useAuthStore.getState()?.user?.restaurant_id || useAuthStore.getState()?.user?.restaurant?.id

  if (!restaurantId) {
    console.error('updateRestaurantProfile: no restaurant id available')
    throw new Error('Restaurant ID is required to update profile')
  }

  // Update top-level restaurant fields (name, phone, address, etc.)
  const payload = { ...data }

  // Normalize frontend camelCase keys to backend snake_case columns
  if (payload.logoUrl) {
    payload.logo_url = payload.logoUrl
    delete payload.logoUrl
  }
  if (payload.coverImageUrl) {
    payload.cover_image_url = payload.coverImageUrl
    delete payload.coverImageUrl
  }
  if (payload.postalCode) {
    payload.postal_code = payload.postalCode
    delete payload.postalCode
  }

  const response = await api.put(`/restaurants/${restaurantId}`, payload)
  return response?.data?.data || response?.data || {}
}

export const deleteRestaurant = async (id) => {
  const response = await api.delete(`/restaurants/${id}`)
  return response?.data?.data || response?.data || {}
}

export const updateRestaurantStatus = async (id, data) => {
  // Normalize payload: accept boolean or object and send snake_case keys
  let payload = {}

  if (typeof data === 'boolean') {
    payload.is_active = data
  } else if (data && typeof data === 'object') {
    // Support camelCase (`isActive`) or snake_case (`is_active`)
    if (typeof data.is_active !== 'undefined') payload.is_active = data.is_active
    else if (typeof data.isActive !== 'undefined') payload.is_active = data.isActive
    else if (typeof data.active !== 'undefined') payload.is_active = data.active
    else payload = { ...data }
  } else {
    // Fallback: coerce to boolean
    payload.is_active = Boolean(data)
  }

  const response = await api.patch(`/restaurants/${id}/status`, payload)
  return response?.data?.data || response?.data || {}
}

export const getRestaurantStats = async (id) => {
  const response = await api.get(`/restaurants/${id}/stats`)
  return response?.data?.data || response?.data || {}
}

export const getPendingVerifications = async () => {
  const response = await api.get('/restaurants/pending-verifications')
  return response?.data?.data || response?.data || []
}

export const verifyRestaurant = async (id, status, notes) => {
  // Normalize verify payload to match backend expectations: { is_verified, rejection_reason }
  let payload = {}

  if (typeof status === 'boolean') {
    payload.is_verified = status
  } else if (status && typeof status === 'object') {
    payload.is_verified = typeof status.is_verified !== 'undefined' ? status.is_verified : status.isVerified || status.status
    payload.rejection_reason = status.rejection_reason || status.rejectionReason || notes
  } else {
    payload.is_verified = Boolean(status)
    if (notes) payload.rejection_reason = notes
  }

  const response = await api.post(`/restaurants/${id}/verify`, payload)
  return response?.data?.data || response?.data || {}
}

export const getRestaurantDocuments = async (id) => {
  const response = await api.get(`/restaurants/${id}/documents`)
  return response?.data?.data || response?.data || []
}

export const uploadDocument = async (formData) => {
  const response = await api.post('/restaurants/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response?.data?.data || response?.data || {}
}

export const deleteDocument = async (id) => {
  const response = await api.delete(`/restaurants/documents/${id}`)
  return response?.data?.data || response?.data || {}
}

export const verifyDocument = async (id, status) => {
  const response = await api.patch(`/restaurants/documents/${id}/verify`, { status })
  return response?.data?.data || response?.data || {}
}

export const updateRestaurantSettings = async (id, settings) => {
  const response = await api.put(`/restaurants/${id}/settings`, settings)
  return response?.data?.data || response?.data || {}
}

export const updateOperatingHours = async (hours) => {
  const response = await api.put('/restaurants/settings/hours', hours)
  return response?.data?.data || response?.data || {}
}

export const updateDeliverySettings = async (settings) => {
  const response = await api.put('/restaurants/settings/delivery', settings)
  return response?.data?.data || response?.data || {}
}

export const updatePaymentSettings = async (settings) => {
  const response = await api.put('/restaurants/settings/payment', settings)
  return response?.data?.data || response?.data || {}
}

export const updateNotificationSettings = async (settings) => {
  const response = await api.put('/restaurants/settings/notifications', settings)
  return response?.data?.data || response?.data || {}
}

export const updateTaxSettings = async (settings) => {
  const response = await api.put('/restaurants/settings/tax', settings)
  return response?.data?.data || response?.data || {}
}

export const updateThemeSettings = async (settings) => {
  const response = await api.put('/restaurants/settings/theme', settings)
  return response?.data?.data || response?.data || {}
}

// export const getRestaurantDashboardData = async (dateRange) => {
//   const response = await api.get('/restaurants/dashboard', { params: dateRange })
//   return response?.data?.data || response?.data || {}
// }
// Add this to your restaurantService.js
export const getRestaurantDashboardData = async ({ restaurantId, startDate, endDate }) => {
  // Normalize restaurantId: accept string or object shapes and pick the actual id value
  let rid = restaurantId
  if (typeof rid === 'object' && rid !== null) {
    rid = rid.id || rid.restaurant_id || rid._id || (rid.restaurant && (rid.restaurant.id || rid.restaurant._id)) || null
  }

  if (!rid || rid === '[object Object]') {
    console.error('getRestaurantDashboardData: invalid restaurantId', restaurantId)
    throw new Error('Invalid restaurant ID')
  }

  const encodedId = encodeURIComponent(rid)
  const response = await api.get(`/restaurants/${encodedId}/dashboard`, {
    params: {
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    }
  })
  return response?.data?.data || response?.data || {}
}