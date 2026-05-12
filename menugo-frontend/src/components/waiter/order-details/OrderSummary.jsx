import React from 'react'

const fmt = (n) => {
  const v = Number(n)
  if (isNaN(v)) return '0.00'
  return v.toFixed(2)
}

const OrderSummary = ({ order }) => {
  const items = order.items || []
  const computedSubtotal = items.reduce((s, it) => s + (Number(it.unitPrice || 0) * Number(it.quantity || 0)), 0)
  const subtotal = Number(order.subtotal ?? computedSubtotal) || computedSubtotal
  const taxAmount = Number(order.taxAmount ?? order.tax ?? 0) || 0
  const serviceCharge = Number(order.serviceCharge ?? 0) || 0
  const discountAmount = Number(order.discountAmount ?? 0) || 0
  const totalAmount = Number(order.totalAmount ?? (subtotal + taxAmount + serviceCharge - discountAmount)) || (subtotal + taxAmount + serviceCharge - discountAmount)

  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="text-gray-900">${fmt(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Tax</span>
          <span className="text-gray-900">${fmt(taxAmount)}</span>
        </div>
        {serviceCharge > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Service Charge</span>
            <span className="text-gray-900">${fmt(serviceCharge)}</span>
          </div>
        )}
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Discount</span>
            <span className="text-red-600">-${fmt(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
          <span>Total</span>
          <span className="text-primary-600">${fmt(totalAmount)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary