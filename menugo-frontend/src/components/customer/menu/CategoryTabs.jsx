import React from 'react'
import { motion } from 'framer-motion'

const CategoryTabs = ({ categories, selected, onSelect }) => {
  const allCategories = [{ id: 'all', name: 'All' }, ...categories]

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 px-4 pb-3">
        {allCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              selected === category.id
                ? 'text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {category.name}
            {selected === category.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryTabs