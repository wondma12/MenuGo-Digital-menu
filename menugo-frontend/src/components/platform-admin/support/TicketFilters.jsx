import React from 'react'
import Select from '../../../common/Select'

const TicketFilters = ({ filters, onFiltersChange }) => {
  const handleChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      priority: 'all',
      category: 'all',
    })
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Status"
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'open', label: 'Open' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' },
          ]}
        />
        <Select
          label="Priority"
          value={filters.priority}
          onChange={(e) => handleChange('priority', e.target.value)}
          options={[
            { value: 'all', label: 'All Priorities' },
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' },
          ]}
        />
        <Select
          label="Category"
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
          options={[
            { value: 'all', label: 'All Categories' },
            { value: 'general', label: 'General' },
            { value: 'technical', label: 'Technical' },
            { value: 'billing', label: 'Billing' },
            { value: 'feature', label: 'Feature Request' },
            { value: 'bug', label: 'Bug Report' },
          ]}
        />
      </div>
      <div className="flex justify-end mt-4">
        <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700">
          Clear Filters
        </button>
      </div>
    </div>
  )
}

export default TicketFilters