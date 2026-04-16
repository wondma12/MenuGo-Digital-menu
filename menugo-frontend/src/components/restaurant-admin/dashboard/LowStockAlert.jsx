import React from 'react'
import { ExclamationTriangleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import Button from '../../../common/Button'
import { useNavigate } from 'react-router-dom'

const LowStockAlert = ({ items }) => {
  const navigate = useNavigate()
  const lowStockItems = items || []

  if (lowStockItems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div className="flex items-center gap-3 text-green-600">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">All inventory levels are healthy</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-yellow-100 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
            <p className="text-xs text-gray-500">{lowStockItems.length} items need attention</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/restaurant/inventory')}
          className="text-primary-600 hover:text-primary-700"
        >
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {lowStockItems.slice(0, 5).map((item, index) => (
          <div key={item.id || index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{item.name}</p>
                {item.unit && (
                  <span className="text-xs text-gray-500">({item.unit})</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Current:</span>
                  <span className="text-xs font-medium text-red-600">{item.stock || item.quantity || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Reorder at:</span>
                  <span className="text-xs font-medium text-gray-700">{item.reorderLevel || 10}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigate(`/restaurant/inventory/reorder/${item.id}`)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ShoppingCartIcon className="w-3 h-3" />
              Reorder
            </button>
          </div>
        ))}
      </div>

      {lowStockItems.length > 5 && (
        <div className="mt-3 text-center">
          <button 
            onClick={() => navigate('/restaurant/inventory')}
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            + {lowStockItems.length - 5} more items
          </button>
        </div>
      )}
    </div>
  )
}

export default LowStockAlert