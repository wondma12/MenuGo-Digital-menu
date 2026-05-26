import React from 'react'
import Select from '../../../common/Select'

const UserFilters = ({ filters, onFiltersChange, showRole = true }) => {
  const handleChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="rounded-none border border-orange-100 bg-gradient-to-br from-white to-orange-50/40 p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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