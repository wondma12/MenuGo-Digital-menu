import React from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import DateRangePicker from '../analytics/DateRangePicker'

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
    <div className="bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] rounded-none">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
          <input
            type="text"
            placeholder="Search by order # or customer..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className={`w-full appearance-none rounded-none border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-slate-900 transition-all duration-200 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100`}
          />
          {filters.search && (
            <button onClick={() => handleChange('search', '')} className="absolute right-1 top-1/2 h-10 -translate-y-1/2 rounded-none border border-slate-200 bg-white px-3 text-sm text-slate-500 hover:text-slate-700">
              Clear
            </button>
          )}
        </div>
        <DateRangePicker
          value={filters.dateRange}
          onChange={(dateRange) => handleChange('dateRange', dateRange)}
          className="w-full"
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

export default OrderFilters