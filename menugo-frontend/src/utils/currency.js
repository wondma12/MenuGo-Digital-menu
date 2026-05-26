import { CURRENCY } from './constants'

export const formatPrice = (price, currency = CURRENCY.CODE, useCode = true) => {
  // Default to showing the currency code (e.g. "ETB 350.00") so it's always visible on dashboards.
  // If callers prefer the currency symbol, pass `useCode = false`.
  if (price === null || price === undefined) return `${useCode ? CURRENCY.CODE : CURRENCY.SYMBOL} 0.00`

  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: 'currency',
    currency,
    currencyDisplay: useCode ? 'code' : 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

export const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    const itemPrice = item.price * item.quantity
    const optionsPrice = Object.values(item.selectedOptions || {}).reduce((sum, val) => sum + val, 0) * item.quantity
    return total + itemPrice + optionsPrice
  }, 0)
}

export const calculateTax = (subtotal, taxRate = 10) => {
  return (subtotal * taxRate) / 100
}

export const calculateDiscount = (subtotal, discountType, discountValue) => {
  if (discountType === 'percentage') {
    return (subtotal * discountValue) / 100
  }
  return discountValue
}

export const calculateServiceCharge = (subtotal, serviceChargeRate = 0) => {
  return (subtotal * serviceChargeRate) / 100
}

export const calculateDeliveryFee = (distance, baseFee = 3.99, perKmFee = 0.5) => {
  return baseFee + distance * perKmFee
}

export const roundPrice = (price, decimals = 2) => {
  return Number(Math.round(price + 'e' + decimals) + 'e-' + decimals)
}

export const isValidPrice = (price) => {
  return !isNaN(price) && price >= 0 && price <= 999999.99
}

export const priceToCents = (price) => {
  return Math.round(price * 100)
}

export const centsToPrice = (cents) => {
  return cents / 100
}

export const getPriceBreakdown = (items, taxRate = 10, serviceChargeRate = 0, deliveryFee = 0, discount = 0) => {
  const subtotal = calculateTotal(items)
  const taxAmount = calculateTax(subtotal, taxRate)
  const serviceCharge = calculateServiceCharge(subtotal, serviceChargeRate)
  const discountAmount = calculateDiscount(subtotal, 'percentage', discount)
  const total = subtotal + taxAmount + serviceCharge + deliveryFee - discountAmount

  return {
    subtotal: roundPrice(subtotal),
    taxAmount: roundPrice(taxAmount),
    serviceCharge: roundPrice(serviceCharge),
    deliveryFee: roundPrice(deliveryFee),
    discountAmount: roundPrice(discountAmount),
    total: roundPrice(total),
  }
}

export const formatPriceShort = (value, currency = CURRENCY.CODE) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return `${currency} 0.00`
  const v = Number(value)
  const abs = Math.abs(v)
  if (abs >= 1000000) {
    const m = v / 1000000
    return `${currency} ${Number.isInteger(m) ? m.toLocaleString() + 'M' : m.toFixed(1) + 'M'}`
  }
  if (abs >= 1000) {
    const k = v / 1000
    return `${currency} ${Number.isInteger(k) ? k.toLocaleString() + 'k' : k.toFixed(1) + 'k'}`
  }
  return `${currency} ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}