import api from './api'

export const generateQRCode = async (restaurantId, tableId) => {
  const response = await api.post(`/restaurants/${restaurantId}/qrcode`, { tableId })
  return response.data
}

// Generate or return restaurant-level QR (backend: POST /qr/restaurant/:restaurantId/generate)
export const generateRestaurantQRCode = async (restaurantId, options = {}) => {
  const params = new URLSearchParams()
  if (options.route) params.set('route', options.route)
  if (options.table) params.set('table', options.table)
  if (options.orderId) params.set('orderId', options.orderId)

  const qs = params.toString()
  const url = `/qr/restaurant/${restaurantId}/generate${qs ? `?${qs}` : ''}`
  const response = await api.post(url)
  // Normalize to return the data payload directly when possible
  return response.data?.data || response.data
}

// Generate a table QR (server will reuse restaurant-level QR); accepts restaurantId and tableId
export const generateTableQRCode = async (restaurantId, tableId) => {
  const response = await api.post(`/qr/restaurant/${restaurantId}/table/${tableId}/generate`)
  return response.data?.data || response.data
}

export const getQRCode = async (restaurantId, tableId) => {
  const response = await api.get(`/restaurants/${restaurantId}/qrcode`, { params: { tableId } })
  return response.data
}

export const downloadQRCode = async (restaurantId, tableId, format = 'png') => {
  const response = await api.get(`/restaurants/${restaurantId}/qrcode/download`, {
    params: { tableId, format },
    responseType: 'blob',
  })
  return response.data
}

export const regenerateQRCode = async (restaurantId, tableId) => {
  const response = await api.post(`/restaurants/${restaurantId}/qrcode/regenerate`, { tableId })
  return response.data
}

export const getQRCodeAnalytics = async (restaurantId, tableId, dateRange) => {
  const response = await api.get(`/restaurants/${restaurantId}/qrcode/analytics`, {
    params: { tableId, ...dateRange },
  })
  return response.data
}

export const scanQRCode = async (code) => {
  const response = await api.post('/qrcode/scan', { code })
  return response.data
}
