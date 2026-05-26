const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const isUuidLike = (value) => UUID_PATTERN.test(String(value || '').trim())

export const normalizeQrImageSrc = (value) => {
  const normalized = String(value || '').trim()
  if (!normalized) return null
  if (normalized.startsWith('data:image')) return normalized
  if (normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('/')) {
    return normalized
  }
  return `data:image/png;base64,${normalized}`
}

export const getQrTargetUrl = (payload = {}) => (
  payload?.qr_code?.url ||
  payload?.url ||
  ''
)

export const extractQrIdentifier = (payload) => {
  if (!payload) return null

  if (typeof payload === 'string') {
    const normalized = payload.trim()
    if (!normalized) return null

    if (normalized.includes('/qr/download/')) {
      const parts = normalized.split('/').filter(Boolean)
      return parts[parts.length - 1] || null
    }

    return normalized
  }

  const directIdentifier =
    payload?.qr_code?.identifier ||
    payload?.identifier ||
    null

  if (directIdentifier) return directIdentifier

  const downloadUrl = payload?.download_url || payload?.qr_code?.download_url
  if (downloadUrl) return extractQrIdentifier(downloadUrl)

  return null
}
