import React from 'react'
import { motion } from 'framer-motion'

const MenuListView = ({ items, onItemClick }) => {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          onClick={() => onItemClick(item)}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex gap-3">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover" />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
            )}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <span className="font-bold text-primary-600">${item.price}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {item.isVegetarian && <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">Veg</span>}
                {item.isVegan && <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">Vegan</span>}
                {item.isGlutenFree && <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">GF</span>}
                {item.spiceLevel > 0 && (
                  <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                    {'🔥'.repeat(item.spiceLevel)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default MenuListView