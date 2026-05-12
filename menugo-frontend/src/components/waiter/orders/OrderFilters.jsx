import React from 'react'
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
    <div className="flex gap-3">
      <Select
        value={filters.status}
        onChange={(e) => handleChange('status', e.target.value)}
        options={statusOptions}
        className="w-36"
      />
      <Select
        value={filters.priority}
        onChange={(e) => handleChange('priority', e.target.value)}
        options={priorityOptions}
        className="w-36"
      />
      <Select
        value={filters.range || 'all'}
        onChange={(e) => handleChange('range', e.target.value)}
        options={rangeOptions}
        className="w-40"
      />
    </div>
  )
}

export default OrderFilters