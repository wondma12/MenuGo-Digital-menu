import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

const FilterDrawer = ({ isOpen, onClose, filters, onApply }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  const dietaryOptions = [
    { value: 'isVegetarian', label: 'Vegetarian' },
    { value: 'isVegan', label: 'Vegan' },
    { value: 'isGlutenFree', label: 'Gluten Free' }
  ]

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
      dietary: [],
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
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Dietary Preferences</h3>
                  <div className="space-y-2">
                    {dietaryOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localFilters.dietary.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocalFilters({
                                ...localFilters,
                                dietary: [...localFilters.dietary, option.value]
                              })
                            } else {
                              setLocalFilters({
                                ...localFilters,
                                dietary: localFilters.dietary.filter(d => d !== option.value)
                              })
                            }
                          }}
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Spice Level</h3>
                  <div className="flex flex-wrap gap-2">
                    {spiceOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setLocalFilters({ ...localFilters, spiceLevel: option.value })}
                        className={`px-3 py-1.5 rounded-full text-sm ${
                          localFilters.spiceLevel === option.value
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700'
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
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Min"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={localFilters.priceRange.max}
                      onChange={(e) => setLocalFilters({
                        ...localFilters,
                        priceRange: { ...localFilters.priceRange, max: parseInt(e.target.value) || 100 }
                      })}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 flex gap-3">
                <button onClick={handleReset} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Reset
                </button>
                <button onClick={handleApply} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
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