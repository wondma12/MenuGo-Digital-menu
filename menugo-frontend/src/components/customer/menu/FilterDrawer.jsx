import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

const FilterDrawer = ({ isOpen, onClose, filters, onApply, categories = [] }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  React.useEffect(() => {
    setLocalFilters(filters)
  }, [filters, isOpen])

  const categoryOptions = Array.isArray(categories)
    ? categories.map((category) => ({
        value: String(category.id),
        label: category.name || 'Unnamed category'
      }))
    : []

  const spiceOptions = [
    { value: 'all', label: 'All' },
    { value: '0', label: 'No Spice' },
    { value: '1', label: 'Mild' },
    { value: '2', label: 'Medium' },
    { value: '3', label: 'Hot' },
    { value: '4', label: 'Very Hot' },
    { value: '5', label: 'Extreme' }
  ]

  const handleApply = () => {
    onApply(localFilters)
    onClose()
  }

  const handleReset = () => {
    setLocalFilters({
      categories: [],
      priceRange: { min: 0, max: 100 },
      spiceLevel: 'all'
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50"
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 border-b border-slate-200">
                <h2 className="text-lg font-black text-slate-900">Filters</h2>
                <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categoryOptions.length > 0 ? categoryOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localFilters.categories.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocalFilters({
                                ...localFilters,
                                categories: [...localFilters.categories, option.value]
                              })
                            } else {
                              setLocalFilters({
                                ...localFilters,
                                categories: localFilters.categories.filter(categoryId => categoryId !== option.value)
                              })
                            }
                          }}
                          className="w-4 h-4 text-orange-600 rounded border-slate-300"
                        />
                        <span className="text-sm text-slate-700">{option.label}</span>
                      </label>
                    )) : <p className="text-sm text-slate-500">No categories available</p>}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Spice Level</h3>
                  <div className="flex flex-wrap gap-2">
                    {spiceOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setLocalFilters({ ...localFilters, spiceLevel: option.value })}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          localFilters.spiceLevel === option.value
                            ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/30'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300 hover:text-orange-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={localFilters.priceRange.min}
                      onChange={(e) => setLocalFilters({
                        ...localFilters,
                        priceRange: { ...localFilters.priceRange, min: parseInt(e.target.value) || 0 }
                      })}
                      className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900"
                      placeholder="Min"
                    />
                    <span className="text-slate-600">-</span>
                    <input
                      type="number"
                      value={localFilters.priceRange.max}
                      onChange={(e) => setLocalFilters({
                        ...localFilters,
                        priceRange: { ...localFilters.priceRange, max: parseInt(e.target.value) || 100 }
                      })}
                      className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 flex gap-3">
                <button onClick={handleReset} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">
                  Reset
                </button>
                <button onClick={handleApply} className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/30 transition-all hover:from-orange-700 hover:to-orange-600 hover:opacity-95">
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default FilterDrawer