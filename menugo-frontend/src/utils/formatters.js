import { format } from 'date-fns'
import { CURRENCY, DATE_FORMATS } from './constants'

export const formatCurrency = (amount, currency = CURRENCY.CODE, locale = CURRENCY.LOCALE) => {
  if (amount === null || amount === undefined) return `${CURRENCY.SYMBOL}0.00`
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (date, formatStr = DATE_FORMATS.DISPLAY) => {
  if (!date) return '-'
  return format(new Date(date), formatStr)
}

export const formatDateTime = (date) => {
  return formatDate(date, DATE_FORMATS.DISPLAY_WITH_TIME)
}

export const formatTime = (time) => {
  if (!time) return '-'
  return formatDate(time, DATE_FORMATS.TIME)
}

export const formatPhoneNumber = (phone) => {
  if (!phone) return '-'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
  }
  return phone
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export const formatPercentage = (value, decimals = 1) => {
  return `${formatNumber(value, decimals)}%`
}

export const formatOrderNumber = (orderNumber) => {
  if (!orderNumber) return '-'
  return `#${orderNumber}`
}

export const formatTableNumber = (tableNumber) => {
  if (!tableNumber) return '-'
  return `Table ${tableNumber}`
}

export const formatRating = (rating) => {
  if (!rating) return '0.0'
  return rating.toFixed(1)
}

export const formatDuration = (minutes) => {
  if (!minutes) return '-'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export const formatAddress = (address) => {
  if (!address) return '-'
  const parts = [address.street, address.city, address.state, address.postalCode].filter(Boolean)
  return parts.join(', ')
}

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const capitalizeFirstLetter = (string) => {
  if (!string) return ''
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

export const toTitleCase = (str) => {
  if (!str) return ''
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

export const slugToTitle = (slug) => {
  if (!slug) return ''
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const formatStatus = (status) => {
  if (!status) return '-'
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}