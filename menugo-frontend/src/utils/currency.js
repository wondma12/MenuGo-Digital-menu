import { CURRENCY } from './constants'

export const formatPrice = (price, currency = CURRENCY.CODE) => {
  if (price === null || price === undefined) return `${CURRENCY.SYMBOL}0.00`
  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: 'currency',
    currency,
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