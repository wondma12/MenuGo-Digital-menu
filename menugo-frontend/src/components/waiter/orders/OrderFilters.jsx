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
    { value: 'served', label: 'Served' }
  ]

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'normal', label: 'Normal' },
    { value: 'low', label: 'Low' }
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
    </div>
  )
}

export default OrderFilters