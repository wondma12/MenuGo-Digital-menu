import React from 'react'
import { motion } from 'framer-motion'

const PopularItemsChart = ({ items }) => {
  const list = Array.isArray(items) ? items : []

  return (
    <div className="rounded-none bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Popular Items</h3>
      <div className="space-y-4">
        {list.length === 0 ? (
          <p className="text-sm text-slate-500">No popular items found for the selected period.</p>
        ) : list.slice(0, 5).map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-sm font-medium text-slate-500">#{index + 1}</span>
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-10 w-10 rounded-none object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-none bg-slate-100">
                  <span className="text-xs text-slate-400">No img</span>
                </div>
              )}
              <div>
                <p className="font-medium text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900">{item.orders || 0} orders</p>
              <p className="text-xs text-slate-500">{item.revenue || 0}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default PopularItemsChart