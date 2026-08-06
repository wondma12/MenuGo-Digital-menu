
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Select from '../../../common/Select'

const CategoryFilter = ({ filters, onFiltersChange }) => {
  const handleChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
    })
  }

  const hasActiveFilters = filters.search || filters.status !== 'all'

  return (
    <div className="bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full rounded-none border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
          />
        </div>
        <Select
          label="Status"
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={[
            { value: 'all', label: 'All Categories' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end pt-3">
          <button
            onClick={clearFilters}
            className="text-sm text-orange-600 hover:text-orange-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default CategoryFilter