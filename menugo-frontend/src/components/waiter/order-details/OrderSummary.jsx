import React from 'react'

const OrderSummary = ({ order }) => {
  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="text-gray-900">${order.subtotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Tax</span>
          <span className="text-gray-900">${order.taxAmount}</span>
        </div>
        {order.serviceCharge > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Service Charge</span>
            <span className="text-gray-900">${order.serviceCharge}</span>
          </div>
        )}
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Discount</span>
            <span className="text-red-600">-${order.discountAmount}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
          <span>Total</span>
          <span className="text-primary-600">${order.totalAmount}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary