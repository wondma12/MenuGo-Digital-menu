
import { ExclamationTriangleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import Button from '../../../common/Button'
import { useNavigate } from 'react-router-dom'

const LowStockAlert = ({ items }) => {
  const navigate = useNavigate()
  const lowStockItems = items || []

  if (lowStockItems.length === 0) {
    return (
      <div className="rounded-none bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-3 text-emerald-600">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">All inventory levels are healthy</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-none bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-none bg-amber-100 p-1.5">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Low Stock Alert</h3>
            <p className="text-xs text-slate-500">{lowStockItems.length} items need attention</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/restaurant/inventory')}
          className="text-orange-600 hover:text-orange-700"
        >
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {lowStockItems.slice(0, 5).map((item, index) => (
          <div key={item.id || index} className="flex items-center justify-between rounded-none bg-amber-50 p-3 transition-colors hover:bg-amber-100">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-900">{item.name}</p>
                {item.unit && (
                  <span className="text-xs text-slate-500">({item.unit})</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500">Current:</span>
                  <span className="text-xs font-medium text-red-600">{item.stock || item.quantity || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500">Reorder at:</span>
                  <span className="text-xs font-medium text-slate-700">{item.reorderLevel || 10}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigate(`/restaurant/inventory/reorder/${item.id}`)}
              className="flex items-center gap-1 rounded-none border border-orange-100 bg-white px-3 py-1.5 text-xs transition-colors hover:bg-orange-50"
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
            className="text-xs text-orange-600 hover:text-orange-700"
          >
            + {lowStockItems.length - 5} more items
          </button>
        </div>
      )}
    </div>
  )
}

export default LowStockAlert