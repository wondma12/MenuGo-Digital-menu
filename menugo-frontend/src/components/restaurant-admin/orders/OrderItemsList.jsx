import React from 'react'

const formatCurrency = (value) => {
  const v = Number(value || 0)
  return "$" + v.toFixed(2)
}

const OrderItemsList = ({ items = [], order = {} }) => {
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>

      <div className="space-y-2">
        {items.map((item, index) => {
          return (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 flex items-center gap-3">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">No Image</div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{item.quantity}x</span>
                    <span className="text-gray-700">{item.name}</span>
                  </div>

                  {item.options && item.options.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1 ml-6">
                      {item.options.map(opt => `${opt.name}: ${opt.choice}`).join(', ')}
                    </div>
                  )}

                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1 ml-6">+ {item.modifiers.map(m => m.name).join(', ')}</div>
                  )}

                  {item.specialInstructions && (
                    <div className="text-xs text-yellow-600 mt-1 ml-6">Note: {item.specialInstructions}</div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="font-medium text-gray-900">{formatCurrency(item.quantity * item.unitPrice)}</p>
                <p className="text-xs text-gray-500">{formatCurrency(item.unitPrice)} each</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-500">Tax</span>
          <span className="text-gray-900">{formatCurrency(order.taxAmount)}</span>
        </div>

        <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-200">
          <span>Total</span>
          <span className="text-primary-600">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderItemsList