
import Select from '../../common/Select'

const OrderFilters = ({ filters, onFiltersChange }) => {
  const handleChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'verified', label: 'Verified' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'completed', label: 'Completed' }
  ]

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'normal', label: 'Normal' },
    { value: 'low', label: 'Low' }
  ]

  const rangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 days' },
    { value: 'month', label: 'Last 30 days' },
    { value: 'year', label: 'Last 365 days' },
  ]

  return (
    <div className="flex flex-nowrap items-center gap-3 rounded-3xl border-orange-100 bg-gradient-to-r from-white to-orange-50/40 p-3 shadow-sm">
      <Select
        value={filters.status}
        onChange={(e) => handleChange('status', e.target.value)}
        options={statusOptions}
        containerClassName="mb-0"
        className="!w-auto w-36 text-sm py-1.5 px-3 rounded-lg"
      />
      <Select
        value={filters.priority}
        onChange={(e) => handleChange('priority', e.target.value)}
        options={priorityOptions}
        containerClassName="mb-0"
        className="!w-auto w-36 text-sm py-1.5 px-3 rounded-lg"
      />
      <Select
        value={filters.range || 'all'}
        onChange={(e) => handleChange('range', e.target.value)}
        options={rangeOptions}
        containerClassName="mb-0"
        className="!w-auto w-40 text-sm py-1.5 px-3 rounded-lg"
      />
    </div>
  )
}

export default OrderFilters