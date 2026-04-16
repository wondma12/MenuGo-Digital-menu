import React from 'react'
import { motion } from 'framer-motion'
import { ExclamationTriangleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import Button from '../../../common/Button'

const LowStockAlert = ({ items, onRefresh }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ExclamationTriangleIcon className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">All Stock Levels Healthy</h3>
        <p className="text-gray-500 mt-1">No items are currently below reorder level</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
        <div className="flex items-center gap-2 mb-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-yellow-800">Low Stock Alert</h3>
          <span className="ml-auto text-sm text-yellow-700">{items.length} items need attention</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl p-4 border-l-4 border-l-yellow-500 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                <p className="text-xs text-gray-500">{item.category}</p>
              </div>
              <span className="text-sm font-bold text-red-600">{item.quantity} {item.unit} left</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-3">
              <span>Reorder at: {item.reorderLevel} {item.unit}</span>
              <span>Need: {item.reorderLevel - item.quantity} {item.unit}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="warning" icon={ShoppingCartIcon} className="flex-1">
                Order Now
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default LowStockAlert