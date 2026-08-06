
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Select from '../../../common/Select'

const StaffFilters = ({ filters, onFiltersChange }) => {
  const handleChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    // Preserve restaurant context when clearing UI filters
    onFiltersChange({
      role: 'all',
      status: 'all',
      search: '',
      restaurantId: filters?.restaurantId || filters?.restaurant_id || null,
    })
  }

  const hasActiveFilters = filters.search || filters.role !== 'all' || filters.status !== 'all'

  return (
    <div className="rounded-none border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 md:grid md:grid-cols-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full appearance-none rounded-none border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-slate-700 transition-colors focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
          />
          {filters.search && (
            <button onClick={() => handleChange('search', '')} className="absolute right-1 top-1/2 h-10 -translate-y-1/2 rounded-none border border-slate-200 bg-white px-3 text-sm text-slate-500 hover:text-slate-700">
              Clear
            </button>
          )}
        </div>
        <Select
          label=""
          value={filters.role}
          onChange={(e) => handleChange('role', e.target.value)}
          options={[
            { value: 'all', label: 'All Roles' },
            { value: 'admin', label: 'Admin' },
            // { value: 'manager', label: 'Manager' },
            { value: 'waiter', label: 'Waiter' },
            { value: 'chef', label: 'Chef' },
            // { value: 'cashier', label: 'Cashier' },
            // { value: 'delivery', label: 'Delivery' },
          ]}
        />
        <Select
          label=""
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-start border-t border-slate-100 pt-3 sm:justify-end">
          <button onClick={clearFilters} className="text-sm font-medium text-orange-600 hover:text-orange-700">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default StaffFilters