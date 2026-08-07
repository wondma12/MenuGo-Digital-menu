// src/services/restaurantService.js
import api from './api'
import { useAuthStore } from '../store/authStore'

export const getRestaurants = async (params) => {
  // Call /restaurants/admin/all if user is platform admin and authenticated
  // Otherwise call public /restaurants endpoint
  // The backend will handle auth checks and filtering accordingly
  try {
    const response = await api.get('/restaurants/admin/all', { params })
    console.log('[getRestaurants] Admin endpoint response:', response?.data)
    return handleRestaurantResponse(response)
  } catch (error) {
    // If admin endpoint fails (not authenticated), fall back to public endpoint
    console.warn('[getRestaurants] Admin endpoint failed:', error?.message, error?.response?.status)
    if (error?.response?.status === 401 || error?.isAuthMissing) {
      try {
        const publicResponse = await api.get('/restaurants', { params })
        console.log('[getRestaurants] Public endpoint response:', publicResponse?.data)
        return handleRestaurantResponse(publicResponse)
      } catch (publicError) {
        console.error('[getRestaurants] Public endpoint also failed:', publicError?.message)
        throw publicError
      }
    }
    throw error
  }
}

const handleRestaurantResponse = (response) => {
  // Unwrap the response to match what the component expects
  const payload = response?.data?.data || response?.data || {}
  
  // Normalize restaurants: ensure `total_menu_items` is populated when possible
  const restaurants = (payload.restaurants || []).map((r) => {
    const totalMenu = r.total_menu_items ?? r.totalMenuItems ?? (Array.isArray(r.menu_items) ? r.menu_items.length : undefined) ?? r.menu_count ?? r.menuCount ?? 0
    return {
      ...r,
      total_menu_items: totalMenu,
    }
  })

  // Return the data in the format expected by RestaurantList component
  return {
    restaurants,
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
  let response
  if (data instanceof FormData) {
    response = await api.post('/restaurants', data, { headers: { 'Content-Type': 'multipart/form-data' } })
  } else {
    response = await api.post('/restaurants', data)
  }
  return response?.data?.data || response?.data || {}
}

// src/services/restaurantService.js

export const updateRestaurant = async (idOrPayload, maybeData) => {
  // Support both signatures: (id, data) and ({ id, data })
  let restaurantId
  let data

  if (typeof idOrPayload === 'object' && idOrPayload !== null && !Array.isArray(idOrPayload) && typeof maybeData === 'undefined') {
    // Called as updateRestaurant({ id, data })
    restaurantId = idOrPayload.id || idOrPayload._id || idOrPayload.restaurant_id
    data = idOrPayload.data || idOrPayload.payload || null
  } else {
    restaurantId = typeof idOrPayload === 'object' ? idOrPayload.id || idOrPayload._id : idOrPayload
    data = maybeData
  }

  if (!restaurantId || restaurantId === '[object Object]') {
    console.error('Invalid restaurant ID:', idOrPayload);
    throw new Error('Invalid restaurant ID');
  }

  let response
  if (data instanceof FormData) {
    response = await api.put(`/restaurants/${restaurantId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
  } else {
    response = await api.put(`/restaurants/${restaurantId}`, data)
  }

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

  const normalizeSettings = (value) => {
    if (!value) return {};
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        return {};
      }
    }
    return value;
  };

  const settings = normalizeSettings(r.settings);
  const businessLicenseSettings =
    settings?.business_license && typeof settings.business_license === 'object' && !Array.isArray(settings.business_license)
      ? settings.business_license
      : {};
  const resolvedBusinessLicenseUrl = (
    r.business_license_url ||
    r.businessLicenseUrl ||
    settings?.business_license_url ||
    settings?.businessLicenseUrl ||
    businessLicenseSettings.url ||
    businessLicenseSettings.fileUrl ||
    businessLicenseSettings.file_url ||
    businessLicenseSettings.document_url ||
    businessLicenseSettings.documentUrl ||
    businessLicenseSettings.path ||
    r.document_url ||
    r.documentUrl ||
    null
  );

  const normalized = {
    ...r,
    id: r.id,
    name: r.name,
    description: r.description,
    address: r.address,
    city: r.city,
    state: r.state,
    country: r.country,
    sub_city: r.sub_city || r.subCity || r.restaurant_sub_city || r.restaurantSubCity || null,
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
    subscriptionTier: r.subscription_tier || r.subscriptionTier || 'monthly',
    subscription_tier: r.subscription_tier || 'monthly',
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
    business_license_number: r.business_license_number || r.businessLicenseNumber || settings?.business_license?.number || settings?.business_license_number || settings?.businessLicenseNumber || null,
    tin_number: r.tin_number || r.tinNumber || settings?.tin_number || settings?.tinNumber || settings?.business_license?.tin_number || settings?.business_license?.tinNumber || null,
    business_license_url: resolvedBusinessLicenseUrl,
    settings,
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
  if (payload.businessLicenseUrl) {
    payload.business_license_url = payload.businessLicenseUrl
    delete payload.businessLicenseUrl
  }
  if (payload.businessLicenseNumber) {
    payload.business_license_number = payload.businessLicenseNumber
    delete payload.businessLicenseNumber
  }
  if (payload.googleMapsLink) {
    payload.google_maps_link = payload.googleMapsLink
    delete payload.googleMapsLink
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
  try {
    // The axios interceptor handles token attachment automatically
    // from either auth store or sessionStorage, so just make the request
    const response = await api.get('/restaurants/pending-verifications')
    return response?.data?.data || response?.data || []
  } catch (error) {
    // If auth is missing (401 or no token), return empty array instead of throwing
    if (error.isAuthMissing || error.response?.status === 401) {
      return []
    }
    // Log other errors but don't crash
    console.warn('getPendingVerifications error:', error?.message)
    return []
  }
}

export const verifyRestaurant = async (id, status, notes) => {
  let targetId = id;
  let targetStatus = status;
  let targetNotes = notes;

  // Handle case where arguments are passed as a single object (e.g. from react-query useMutation mutate)
  if (id && typeof id === 'object' && !Array.isArray(id)) {
    targetId = id.restaurantId || id.id || id.restaurant_id;
    targetStatus = typeof id.status !== 'undefined' ? id.status : (typeof id.is_verified !== 'undefined' ? id.is_verified : id.isVerified);
    targetNotes = id.notes || id.rejection_reason || id.rejectionReason;
  }

  // Normalize verify payload to match backend expectations: { is_verified, rejection_reason }
  let payload = {};

  if (targetStatus === 'approved' || targetStatus === true || targetStatus === 'true') {
    payload.is_verified = true;
  } else if (targetStatus === 'rejected' || targetStatus === false || targetStatus === 'false') {
    payload.is_verified = false;
  } else if (targetStatus && typeof targetStatus === 'object') {
    const isVerifiedField = typeof targetStatus.is_verified !== 'undefined' ? targetStatus.is_verified : targetStatus.isVerified || targetStatus.status;
    if (isVerifiedField === 'approved' || isVerifiedField === true || isVerifiedField === 'true') {
      payload.is_verified = true;
    } else if (isVerifiedField === 'rejected' || isVerifiedField === false || isVerifiedField === 'false') {
      payload.is_verified = false;
    } else {
      payload.is_verified = Boolean(isVerifiedField);
    }
    payload.rejection_reason = targetStatus.rejection_reason || targetStatus.rejectionReason || targetNotes;
  } else {
    payload.is_verified = Boolean(targetStatus);
  }

  if (targetNotes && !payload.rejection_reason) {
    payload.rejection_reason = targetNotes;
  }

  const response = await api.post(`/restaurants/${targetId}/verify`, payload);
  return response?.data?.data || response?.data || {};
};

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
  // Determine restaurant id from auth store
  const restaurantId = hours?.restaurantId || hours?.restaurant_id || useAuthStore.getState()?.user?.restaurant_id || useAuthStore.getState()?.user?.restaurant?.id
  if (!restaurantId) {
    console.error('updateOperatingHours: no restaurant id available')
    throw new Error('Restaurant ID is required to update operating hours')
  }

  // Backend expects settings object under `{ settings: { operating_hours: ... } }`
  const body = { settings: { operating_hours: hours } }
  const response = await api.put(`/restaurants/${restaurantId}/settings`, body)
  return response?.data?.data || response?.data || {}
}

export const updateDeliverySettings = async (settings) => {
  // Determine restaurant id from auth store if not provided
  const restaurantId = settings?.restaurantId || settings?.restaurant_id || useAuthStore.getState()?.user?.restaurant_id || useAuthStore.getState()?.user?.restaurant?.id
  if (!restaurantId) {
    console.error('updateDeliverySettings: no restaurant id available')
    throw new Error('Restaurant ID is required')
  }

  // Map frontend camelCase keys to backend snake_case/top-level fields
  const topLevel = {}
  const settingsPayload = {}

  if (typeof settings.enableDelivery !== 'undefined') settingsPayload.enable_delivery = !!settings.enableDelivery
  if (typeof settings.enableTakeaway !== 'undefined') settingsPayload.enable_takeaway = !!settings.enableTakeaway
  if (typeof settings.freeDeliveryThreshold !== 'undefined') settingsPayload.free_delivery_threshold = Number(settings.freeDeliveryThreshold)
  if (typeof settings.estimatedDeliveryTime !== 'undefined') settingsPayload.estimated_delivery_time = Number(settings.estimatedDeliveryTime)

  if (typeof settings.deliveryRadius !== 'undefined') topLevel.delivery_radius_km = Number(settings.deliveryRadius)
  if (typeof settings.deliveryFee !== 'undefined') topLevel.delivery_fee = Number(settings.deliveryFee)
  if (typeof settings.minimumOrderAmount !== 'undefined') topLevel.minimum_order_amount = Number(settings.minimumOrderAmount)

  // Send top-level updates (delivery_fee, delivery_radius_km, minimum_order_amount) if present
  let topResp = null
  if (Object.keys(topLevel).length > 0) {
    topResp = await api.put(`/restaurants/${restaurantId}`, topLevel)
  }

  // Merge settings JSON via the dedicated settings endpoint so we don't overwrite other settings
  let settingsResp = null
  if (Object.keys(settingsPayload).length > 0) {
    settingsResp = await api.put(`/restaurants/${restaurantId}/settings`, settingsPayload)
  }

  return (settingsResp?.data?.data || topResp?.data?.data) || (settingsResp?.data || topResp?.data) || {}
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
  // Determine restaurant id from payload or auth store
  const restaurantId = settings?.restaurantId || settings?.restaurant_id || useAuthStore.getState()?.user?.restaurant_id || useAuthStore.getState()?.user?.restaurant?.id

  if (!restaurantId) {
    console.error('updateTaxSettings: no restaurant id available')
    throw new Error('Restaurant ID is required')
  }

  // Sanitize settings to avoid accidental DOM elements or circular structures
  const payload = {}

  if (typeof settings === 'object' && settings !== null) {
    if (typeof settings.taxRate !== 'undefined') {
      const v = settings.taxRate
      payload.taxRate = (v === '' || v === null) ? null : Number(v)
    }
    if (typeof settings.serviceCharge !== 'undefined') {
      const v = settings.serviceCharge
      payload.serviceCharge = (v === '' || v === null) ? null : Number(v)
    }
    if (typeof settings.serviceChargeType !== 'undefined') payload.serviceChargeType = String(settings.serviceChargeType)
    if (typeof settings.applyTaxToDelivery !== 'undefined') payload.applyTaxToDelivery = Boolean(settings.applyTaxToDelivery)
    if (typeof settings.taxInclusive !== 'undefined') payload.taxInclusive = Boolean(settings.taxInclusive)
  } else {
    throw new Error('Invalid settings payload')
  }

  // Backend expects body to include a `settings` object and the route to be restaurant-scoped
  const body = { settings: payload }
  const response = await api.put(`/restaurants/${restaurantId}/settings`, body)
  return response?.data?.data || response?.data || {}
}

export const updateThemeSettings = async (settings) => {
  const response = await api.put('/restaurants/settings/theme', settings)
  return response?.data?.data || response?.data || {}
}

const parseLocalDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return new Date(value)

  if (typeof value === 'string') {
    const trimmed = value.trim()
    const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (dateOnlyMatch) {
      const year = Number(dateOnlyMatch[1])
      const month = Number(dateOnlyMatch[2]) - 1
      const day = Number(dateOnlyMatch[3])
      return new Date(year, month, day)
    }
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

const formatDateKey = (value) => {
  const parsed = parseLocalDate(value)
  if (!parsed) return null

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const buildDailySeries = (series, startDate, endDate) => {
  const start = parseLocalDate(startDate)
  const end = parseLocalDate(endDate)
  if (!start || !end) return Array.isArray(series) ? series : []

  const map = new Map()
  ;(Array.isArray(series) ? series : []).forEach((item) => {
    const key = formatDateKey(item.date || item.label || item.period || item.month || item.day || item.time)
    if (!key) return

    map.set(key, {
      date: key,
      revenue: Number(item.revenue ?? item.total_revenue ?? item.amount ?? item.value ?? 0),
      orders: Number(item.orders ?? item.total_orders ?? item.order_count ?? item.count ?? 0),
    })
  })

  const normalized = []
  const cursor = new Date(start)
  cursor.setHours(0, 0, 0, 0)
  const last = new Date(end)
  last.setHours(0, 0, 0, 0)

  while (cursor <= last) {
    const key = formatDateKey(cursor)
    const existing = map.get(key) || {}
    normalized.push({
      date: key,
      revenue: Number(existing.revenue ?? 0),
      orders: Number(existing.orders ?? 0),
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  return normalized
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

  // The backend exposes a restaurant-specific dashboard at /dashboard/restaurant
  // which derives the restaurant from the authenticated user. Use that endpoint
  // and pass optional date range params. The frontend may call with restaurantId
  // but the backend ignores it in favor of auth, so we rely on the token.
  const response = await api.get('/dashboard/restaurant', {
    params: {
      startDate: formatDateKey(startDate),
      endDate: formatDateKey(endDate),
      // include restaurantId as a hint for proxies that may accept it
      restaurantId: rid,
    }
  })

  const payload = response?.data?.data || response?.data || {}

  // backend returns { restaurant, stats, recent_orders, ... }
  const stats = payload.stats || {}

  const normalized = {
    // basic restaurant info
    restaurant: payload.restaurant || payload.restaurant || {},
    // completed counts
    completedToday: stats.completed_today ?? stats.completedToday ?? payload.completed_today ?? payload.completedToday ?? 0,
    completedTotal: stats.completed_total ?? stats.completedTotal ?? stats.completed_today ?? stats.completedToday ?? payload.completed_total ?? payload.completedTotal ?? payload.completed_today ?? payload.completedToday ?? 0,
    // flatten key names expected by UI
    todayOrders: stats.today_orders ?? stats.todayOrders ?? payload.today_orders ?? payload.todayOrders ?? 0,
    todayRevenue: stats.today_revenue ?? stats.todayRevenue ?? payload.today_revenue ?? payload.todayRevenue ?? 0,
    ordersChange: stats.orders_growth ?? stats.ordersChange ?? payload.orders_growth ?? payload.ordersChange ?? 0,
    revenueChange: stats.revenue_growth ?? stats.revenueChange ?? payload.revenue_growth ?? payload.revenueChange ?? 0,
    totalMenuItems: stats.total_menu_items ?? stats.totalMenuItems ?? payload.total_menu_items ?? payload.totalMenuItems ?? 0,
    activeCustomers: stats.active_customers ?? stats.activeCustomers ?? payload.active_customers ?? payload.activeCustomers ?? 0,
    avgRating: stats.avg_rating ?? stats.avgRating ?? payload.avg_rating ?? payload.avgRating ?? 0,
    ratingChange: stats.rating_change ?? stats.ratingChange ?? payload.rating_change ?? payload.ratingChange ?? 0,
    revenueData: buildDailySeries(payload.revenue_data || payload.revenueData || [], startDate, endDate).map((point) => {
      const todayKey = formatDateKey(new Date())
      if (point.date === todayKey) {
        return {
          ...point,
          revenue: Number(stats.today_revenue ?? payload.today_revenue ?? point.revenue ?? 0),
          orders: Number(stats.completed_today ?? payload.completed_today ?? stats.today_orders ?? payload.today_orders ?? point.orders ?? 0),
        }
      }
      return point
    }),
    ordersData: buildDailySeries(payload.orders_data || payload.ordersData || payload.revenue_data || payload.revenueData || [], startDate, endDate).map((point) => {
      const todayKey = formatDateKey(new Date())
      if (point.date === todayKey) {
        return {
          ...point,
          orders: Number(stats.completed_today ?? payload.completed_today ?? stats.today_orders ?? payload.today_orders ?? point.orders ?? 0),
          revenue: Number(stats.today_revenue ?? payload.today_revenue ?? point.revenue ?? 0),
        }
      }
      return point
    }),
    popularItems: payload.popular_items || payload.popularItems || [],
    lowStockItems: payload.low_stock_items || payload.lowStockItems || [],
    recentOrders: payload.recent_orders || payload.recentOrders || [],
    todaySchedule: payload.today_schedule || payload.todaySchedule || {},
    customerInsights: payload.customer_insights || payload.customerInsights || {},
  }

  return normalized
}