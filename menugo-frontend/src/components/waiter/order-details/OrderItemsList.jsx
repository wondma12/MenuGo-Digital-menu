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
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">${(item.quantity * item.unitPrice).toFixed(2)}</p>
              <p className="text-xs text-gray-500">${item.unitPrice} each</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderItemsList