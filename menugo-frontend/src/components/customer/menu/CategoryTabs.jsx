import React from 'react'
import { motion } from 'framer-motion'

const CategoryTabs = ({ categories, selected, onSelect }) => {
  const allCategories = [{ id: 'all', name: 'All' }, ...categories]

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 px-1 pb-1">
        {allCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              selected === category.id
                ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white shadow-lg'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {category.name}
            {selected === category.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-full border border-transparent"
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