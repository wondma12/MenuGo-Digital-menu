import React from 'react'

const OrderItemsList = ({ items }) => {
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
      <div className="space-y-2">
        {items.map((item, index) => {
          const qty = Number(item.quantity ?? item.qty ?? 1) || 0
          const price = Number(item.unitPrice ?? item.price ?? 0) || 0
          const lineTotal = price * qty
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
                    <span className="font-medium text-gray-900">{qty}x</span>
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  {item.category && <div className="text-xs text-gray-500 mt-1">{item.category}</div>}
                  {item.options && item.options.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1 ml-6">
                      {item.options.map(opt => `${opt.name}: ${opt.choice ?? opt.value ?? ''}`).join(', ')}
                    </div>
                  )}
                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1 ml-6">+ {item.modifiers.map(m => m.name).join(', ')}</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">${lineTotal.toFixed(2)}</p>
                <p className="text-xs text-gray-500">${price.toFixed(2)} each</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OrderItemsList