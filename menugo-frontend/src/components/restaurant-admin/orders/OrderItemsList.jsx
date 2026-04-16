import React from 'react'

const OrderItemsList = ({ items }) => {
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
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
                <div className="text-xs text-gray-500 mt-1 ml-6">
                  + {item.modifiers.map(m => m.name).join(', ')}
                </div>
              )}
              {item.specialInstructions && (
                <div className="text-xs text-yellow-600 mt-1 ml-6">
                  Note: {item.specialInstructions}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">${(item.quantity * item.unitPrice).toFixed(2)}</p>
              <p className="text-xs text-gray-500">${item.unitPrice} each</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Totals */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="text-gray-900">${order?.subtotal}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-500">Tax</span>
          <span className="text-gray-900">${order?.taxAmount}</span>
        </div>
        <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-200">
          <span>Total</span>
          <span className="text-primary-600">${order?.totalAmount}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderItemsList