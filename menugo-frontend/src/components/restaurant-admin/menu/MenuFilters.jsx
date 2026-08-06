
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

  const handleChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      category: 'all',
      availability: 'all',
    })
  }

  const hasActiveFilters = filters.category !== 'all' || filters.availability !== 'all'

  return (
    <div className="bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end pt-4">
          <button
            onClick={clearFilters}
            className="text-sm text-orange-600 hover:text-orange-700"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default MenuFilters