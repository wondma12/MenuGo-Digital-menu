import React from 'react'
import Select from '../../../common/Select'
import { useQuery } from 'react-query'
import { getCategories } from '../../../services/categoryService'
import { useAuthStore } from '../../../store/authStore'

const MenuFilters = ({ filters, onFiltersChange }) => {
  const { user } = useAuthStore()

  const { data: categories } = useQuery(
    ['categories', user?.restaurant_id],
    () => getCategories(user?.restaurant_id),
    { enabled: !!user?.restaurant_id }
  )

  const dietaryOptions = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'glutenFree', label: 'Gluten Free' },
  ]

  const handleChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleDietaryToggle = (dietary) => {
    const current = filters.dietary || []
    const updated = current.includes(dietary)
      ? current.filter(d => d !== dietary)
      : [...current, dietary]
    onFiltersChange({ ...filters, dietary: updated })
  }

  const clearFilters = () => {
    onFiltersChange({
      category: 'all',
      availability: 'all',
      dietary: [],
    })
  }

  const hasActiveFilters = filters.category !== 'all' || 
                          filters.availability !== 'all' || 
                          (filters.dietary && filters.dietary.length > 0)

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Category"
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
          options={[
            { value: 'all', label: 'All Categories' },
            ...(categories?.map(c => ({ value: c.id, label: c.name })) || []),
          ]}
        />
        <Select
          label="Availability"
          value={filters.availability}
          onChange={(e) => handleChange('availability', e.target.value)}
          options={[
            { value: 'all', label: 'All Items' },
            { value: 'available', label: 'Available' },
            { value: 'unavailable', label: 'Unavailable' },
          ]}
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
        <div className="flex flex-wrap gap-3">
          {dietaryOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.dietary?.includes(option.value)}
                onChange={() => handleDietaryToggle(option.value)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default MenuFilters