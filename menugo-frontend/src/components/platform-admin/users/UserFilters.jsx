import React from 'react'
import Select from '../../../common/Select'

const UserFilters = ({ filters, onFiltersChange, showRole = true }) => {
  const handleChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {showRole && (
          <Select
            label="Role"
            value={filters.role}
            onChange={(e) => handleChange('role', e.target.value)}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'platform_admin,restaurant_admin', label: 'Platform & Restaurant Admins' },
              { value: 'platform_admin', label: 'Platform Admin' },
              { value: 'restaurant_admin', label: 'Restaurant Admin' },
              { value: 'support_agent', label: 'Support Agent' },
              { value: 'waiter', label: 'Waiter' },
              { value: 'customer', label: 'Customer' },
            ]}
          />
        )}
        <Select
          label="Status"
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
        <Select
          label="Verification"
          value={filters.verification}
          onChange={(e) => handleChange('verification', e.target.value)}
          options={[
            { value: 'all', label: 'All' },
            { value: 'verified', label: 'Verified' },
            { value: 'unverified', label: 'Unverified' },
          ]}
        />
      </div>
    </div>
  )
}

export default UserFilters