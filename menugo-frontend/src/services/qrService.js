import api from './api'
import { extractQrIdentifier, isUuidLike } from '../utils/qr'

const getPayload = (response) => response?.data?.data || response?.data || response

const resolveQrIdentifier = async (qrOrRestaurantId, tableId = null) => {
  const directIdentifier = extractQrIdentifier(qrOrRestaurantId)

  if (directIdentifier && !isUuidLike(directIdentifier)) {
    return directIdentifier
  }

  const restaurantId =
    typeof qrOrRestaurantId === 'string'
      ? qrOrRestaurantId
      : directIdentifier

  if (!restaurantId) {
    throw new Error('QR identifier not available')
  }

  const response = await api.get(`/qr/restaurant/${restaurantId}`)
  const qrCodes = getPayload(response)
  const qrList = Array.isArray(qrCodes) ? qrCodes : [qrCodes]

  const matchedQr =
    qrList.find((qr) => qr?.table_id === tableId || qr?.qrcode_table?.id === tableId) ||
    qrList.find((qr) => qr?.is_active !== false) ||
    qrList[0]

  const identifier = extractQrIdentifier(matchedQr)
  if (!identifier) {
    throw new Error('QR identifier not available')
  }

  return identifier
}

export const generateQRCode = async (restaurantId, tableId) => {
  if (tableId) {
    return generateTableQRCode(restaurantId, tableId)
  }

  return generateRestaurantQRCode(restaurantId)
}

export const generateRestaurantQRCode = async (restaurantId, options = {}) => {
  const params = new URLSearchParams()
  if (options.route) params.set('route', options.route)
  if (options.table) params.set('table', options.table)
  if (options.orderId) params.set('orderId', options.orderId)

  const qs = params.toString()
  const url = `/qr/restaurant/${restaurantId}/generate${qs ? `?${qs}` : ''}`
  const response = await api.post(url)
  return getPayload(response)
}

export const generateTableQRCode = async (restaurantId, tableId) => {
  const response = await api.post(`/qr/restaurant/${restaurantId}/table/${tableId}/generate`)
  return getPayload(response)
}

export const getQRCode = async (restaurantId, tableId = null) => {
  const response = await api.get(`/qr/restaurant/${restaurantId}`)
  const qrCodes = getPayload(response)
  const qrList = Array.isArray(qrCodes) ? qrCodes : [qrCodes]

  if (!tableId) {
    return qrList[0] || null
  }

  return (
    qrList.find((qr) => qr?.table_id === tableId || qr?.qrcode_table?.id === tableId) ||
    qrList[0] ||
    null
  )
}

export const downloadQRCode = async (qrOrRestaurantId, tableId = null) => {
  const identifier = await resolveQrIdentifier(qrOrRestaurantId, tableId)
  const response = await api.get(`/qr/download/${identifier}`, {
    responseType: 'blob',
  })
  return response.data
}

export const regenerateQRCode = async (restaurantId, tableId = null) => {
  if (tableId) {
    return generateTableQRCode(restaurantId, tableId)
  }

  return generateRestaurantQRCode(restaurantId)
}

export const getQRCodeAnalytics = async (restaurantId, _tableId = null, dateRange = {}) => {
  const response = await api.get(`/qr/restaurant/${restaurantId}/analytics`, {
    params: dateRange,
  })
  return getPayload(response)
}

export const scanQRCode = async (identifier, payload = {}) => {
  const response = await api.post(`/qr/scan/${identifier}`, payload)
  return getPayload(response)
}
