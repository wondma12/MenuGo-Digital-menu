import React from 'react'
import { motion } from 'framer-motion'

const PopularItemsChart = ({ items }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Items</h3>
      <div className="space-y-4">
        {items.slice(0, 5).map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-400">No img</span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{item.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{item.orders} orders</p>
              <p className="text-xs text-gray-500">${item.revenue}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default PopularItemsChart