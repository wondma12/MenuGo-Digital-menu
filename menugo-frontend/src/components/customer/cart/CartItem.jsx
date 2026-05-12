import React from 'react'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const increase = () => onUpdateQuantity(item.id, (item.quantity || 1) + 1)
  const decrease = () => onUpdateQuantity(item.id, Math.max(0, (item.quantity || 1) - 1))

  const optionsText = item.selectedOptions && Object.keys(item.selectedOptions).length > 0
    ? Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')
    : null

  const itemTotal = ((item.price || 0) + Object.values(item.selectedOptions || {}).reduce((a, b) => a + (Number(b) || 0), 0)) * (item.quantity || 1)

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
      <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
        {item.image && <img src={item.image} alt={item.name} className="w-14 h-14 rounded-md object-cover" />}
        <div>
          <div className="font-medium text-gray-900">{item.name}</div>
          {item.category || item.categoryName || item.menu_category ? (
            <div className="text-xs text-gray-500 mt-1">{item.category ?? item.categoryName ?? item.menu_category}</div>
          ) : null}
          {optionsText && <div className="text-sm text-gray-500">{optionsText}</div>}
          {item.specialInstructions && <div className="text-xs text-gray-400 mt-1">{item.specialInstructions}</div>}
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto mt-3 sm:mt-0 justify-between">
        <div className="flex items-center border rounded-md overflow-hidden">
          <button onClick={decrease} className="px-3 py-1 text-gray-600"><MinusIcon className="w-4 h-4" /></button>
          <div className="px-3 py-1 text-gray-900 font-medium">{item.quantity}</div>
          <button onClick={increase} className="px-3 py-1 text-gray-600"><PlusIcon className="w-4 h-4" /></button>
        </div>

        <div className="text-right">
          <div className="font-medium text-gray-900">${itemTotal.toFixed(2)}</div>
          <button onClick={() => onRemove(item.id)} className="text-sm text-red-500 mt-1">Remove</button>
        </div>
      </div>
    </div>
  )
}

export default CartItem