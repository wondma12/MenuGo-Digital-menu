import React from 'react'
import { Users, Clock } from 'lucide-react'

const WaiterTableCard = ({ table }) => {
  const getStatusConfig = (status) => {
    const configs = {
      available: { label: 'Available', color: 'bg-green-100 text-green-700', border: 'border-green-200' },
      occupied: { label: 'Occupied', color: 'bg-red-100 text-red-700', border: 'border-red-200' },
      reserved: { label: 'Reserved', color: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-200' },
      cleaning: { label: 'Cleaning', color: 'bg-blue-100 text-blue-700', border: 'border-blue-200' }
    }
    return configs[status] || configs.available
  }

  const statusConfig = getStatusConfig(table.status)

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 ${statusConfig.border} p-4 hover:shadow-md transition-all`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Table {table.tableNumber}</h3>
          {table.tableName && <p className="text-xs text-gray-500">{table.tableName}</p>}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Capacity:</span>
          <span className="font-medium text-gray-900 flex items-center gap-1">
            <Users className="w-3 h-3" />
            {table.capacity} persons
          </span>
        </div>
        {table.currentCustomerName && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Customer:</span>
            <span className="text-gray-900">{table.currentCustomerName}</span>
          </div>
        )}
        {table.occupiedSince && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Since:</span>
            <span className="text-gray-900 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(table.occupiedSince).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default WaiterTableCard