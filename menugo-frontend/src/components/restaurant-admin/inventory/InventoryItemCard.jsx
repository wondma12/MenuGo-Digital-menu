import React from 'react'
import { motion } from 'framer-motion'
import { PencilIcon, PlusIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'
import ProgressBar from '../../../common/ProgressBar'

const InventoryItemCard = ({ item, onEdit, onAdjust, onRefresh }) => {
  const getStockPercentage = () => {
    const maxStock = item.reorderLevel * 3
    return Math.min((item.quantity / maxStock) * 100, 100)
  }

  const getStockStatus = () => {
    if (item.quantity <= 0) return { label: 'Out of Stock', color: 'danger', icon: '🔴' }
    if (item.quantity <= item.reorderLevel) return { label: 'Low Stock', color: 'warning', icon: '🟡' }
    return { label: 'In Stock', color: 'success', icon: '🟢' }
  }

  const status = getStockStatus()

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <ArchiveBoxIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <p className="text-xs text-gray-500">{item.category}</p>
            </div>
          </div>
          <Badge variant={status.color} size="sm">
            {status.icon} {status.label}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Current Stock:</span>
            <span className={`font-semibold ${item.quantity <= item.reorderLevel ? 'text-red-600' : 'text-gray-900'}`}>
              {item.quantity} {item.unit}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Reorder Level:</span>
            <span className="text-gray-600">{item.reorderLevel} {item.unit}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Cost per Unit:</span>
            <span className="text-gray-600">${item.costPerUnit}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Supplier:</span>
            <span className="text-gray-600 truncate max-w-[120px]">{item.supplier || 'Not specified'}</span>
          </div>
        </div>

        <ProgressBar value={getStockPercentage()} max={100} size="sm" color={status.color === 'warning' ? 'warning' : 'primary'} />

        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => onAdjust(item)}
            className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1"
          >
            <PlusIcon className="w-3 h-3" />
            Adjust Stock
          </button>
          <button
            onClick={() => onEdit(item)}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-1"
          >
            <PencilIcon className="w-3 h-3" />
            Edit
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default InventoryItemCard