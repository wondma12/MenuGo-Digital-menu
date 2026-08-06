
import Select from '../../../common/Select'

const ReportFilters = ({ filters, onFiltersChange }) => {
  const handleChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const groupByOptions = [
    { value: 'day', label: 'Daily' },
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
    { value: 'quarter', label: 'Quarterly' },
  ]

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'appetizers', label: 'Appetizers' },
    { value: 'main', label: 'Main Courses' },
    { value: 'desserts', label: 'Desserts' },
    { value: 'beverages', label: 'Beverages' },
  ]

  const paymentMethodOptions = [
    { value: 'all', label: 'All Methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'online', label: 'Online' },
  ]

  const clearFilters = () => {
    onFiltersChange({
      groupBy: 'day',
      category: 'all',
      paymentMethod: 'all',
    })
  }

  const hasActiveFilters = filters.category !== 'all' || filters.paymentMethod !== 'all'

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Group By"
          value={filters.groupBy}
          onChange={(e) => handleChange('groupBy', e.target.value)}
          options={groupByOptions}
        />
        <Select
          label="Category"
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
          options={categoryOptions}
        />
        <Select
          label="Payment Method"
          value={filters.paymentMethod}
          onChange={(e) => handleChange('paymentMethod', e.target.value)}
          options={paymentMethodOptions}
        />
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
          <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default ReportFilters