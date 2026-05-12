import React from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import DatePicker from '../../../common/DatePicker'
import Select from '../../../common/Select'

const OrderFilters = ({ filters, onFiltersChange }) => {
  const handleChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      dateRange: null,
      search: '',
    })
  }

  const hasActiveFilters = filters.search || filters.dateRange

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order # or customer..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className={`w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 appearance-none text-black bg-white`}
          />
          {filters.search && (
            <button onClick={() => handleChange('search', '')} className="absolute right-1 top-1/2 -translate-y-1/2 h-10 px-3 border border-gray-300 rounded-lg bg-white text-gray-500 hover:text-gray-700 text-sm">
              Clear
            </button>
          )}
        </div>
        <DatePicker
          selected={filters.dateRange}
          onChange={(date) => handleChange('dateRange', date)}
          placeholderText="Select date"
        />
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default OrderFilters