
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Select from '../../../common/Select'
import DatePicker from '../../../common/DatePicker'

const ReviewFilters = ({ filters, onFiltersChange }) => {
  const handleChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      rating: 'all',
      status: 'all',
      search: '',
      dateRange: null,
    })
  }

  const hasActiveFilters = filters.search || filters.rating !== 'all' || filters.status !== 'all' || filters.dateRange

  return (
    <div className="mb-6 rounded-3xl border border-orange-100 bg-white/95 p-4">
      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700"
          />
        </div>
        <Select
          // label="Rating"
          value={filters.rating}
          onChange={(e) => handleChange('rating', e.target.value)}
          options={[
            { value: 'all', label: 'All Ratings' },
            { value: '5', label: '5 Stars' },
            { value: '4', label: '4 Stars' },
            { value: '3', label: '3 Stars' },
            { value: '2', label: '2 Stars' },
            { value: '1', label: '1 Star' },
          ]}
          containerClassName="mb-0"
          className="text-sm"
        />
        <Select
          // label="Status"
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ]}
          containerClassName="mb-0"
          className="text-sm"
        />
        <DatePicker
          // label="Date Range"
          selected={filters.dateRange}
          onChange={(date) => handleChange('dateRange', date)}
          placeholderText="Select date"
          className="mb-0"
        />
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-start border-t border-slate-100 pt-3 sm:justify-end">
          <button onClick={clearFilters} className="text-sm text-orange-600 hover:text-orange-700">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default ReviewFilters