import React from 'react'

const CartSummary = ({ subtotal, tax, total, discount = 0 }) => {
  return (
    <div className="bg-white rounded-xl p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Subtotal</span>
        <span className="text-gray-900">${subtotal.toFixed(2)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Discount</span>
          <span className="text-red-600">-${discount.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Tax (10%)</span>
        <span className="text-gray-900">${tax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
        <span>Total</span>
        <span className="text-primary-600">${total.toFixed(2)}</span>
      </div>
    </div>
  )
}

export default CartSummary