import React from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Select from '../../../common/Select'

const TableFilters = ({ filters, onFiltersChange }) => {
  const handleChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      status: 'available',
      section: 'all',
      search: '',
    })
  }

  const hasActiveFilters = filters.search || filters.status !== 'available' || filters.section !== 'all'

  return (
    <div className="rounded-none border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by table number..."
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
          // label="Status"
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={[
            { value: 'available', label: 'Available' },
          ]}
        />
        <Select
          // label="Section"
          value={filters.section}
          onChange={(e) => handleChange('section', e.target.value)}
          options={[
            { value: 'all', label: 'All Sections' },
            { value: 'indoor', label: 'Indoor' },
            { value: 'outdoor', label: 'Outdoor' },
            { value: 'patio', label: 'Patio' },
            { value: 'bar', label: 'Bar' },
          ]}
        />
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
          <button onClick={clearFilters} className="text-sm font-medium text-orange-600 hover:text-orange-700">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default TableFilters