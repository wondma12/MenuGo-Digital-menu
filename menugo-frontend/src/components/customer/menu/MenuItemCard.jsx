import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'
import DietaryIcons from './DietaryIcons'
import AvailabilityBadge from './AvailabilityBadge'
import SpiceLevel from './SpiceLevel'

const MenuItemCard = ({ item, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onClick(item)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all"
    >
      <div className="relative">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-36 sm:h-40 md:h-48 lg:h-56 object-cover" />
        ) : (
          <div className="w-full h-36 sm:h-40 md:h-48 lg:h-56 bg-gray-100 flex items-center justify-center">
            <span className="text-3xl sm:text-4xl">🍽️</span>
          </div>
        )}
        {!item.isAvailable && <AvailabilityBadge status="unavailable" />}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          <span className="font-bold text-primary-600">${item.price}</span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DietaryIcons
              isVegetarian={item.isVegetarian}
              isVegan={item.isVegan}
              isGlutenFree={item.isGlutenFree}
            />
            {item.spiceLevel > 0 && <SpiceLevel level={item.spiceLevel} />}
          </div>
          {item.isAvailable && (
            <button className="p-2 sm:p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <ShoppingBagIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default MenuItemCard