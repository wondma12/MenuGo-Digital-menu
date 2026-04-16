import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import { motion } from 'framer-motion'
import { ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline'
import Select from '../../../common/Select'
import Button from '../../../common/Button'
import Loading from '../../../common/Loading'
import { getStaff, updateStaffPermissions } from '../../../services/staffService'
import toast from 'react-hot-toast'

const PermissionManager = () => {
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [permissions, setPermissions] = useState([])

  const { data: staff, isLoading } = useQuery('staff', getStaff)

  const updateMutation = useMutation(updateStaffPermissions, {
    onSuccess: () => {
      toast.success('Permissions updated successfully')
    },
    onError: () => toast.error('Failed to update permissions'),
  })

  if (isLoading) return <Loading />

  const handleStaffSelect = (staffMember) => {
    setSelectedStaff(staffMember)
    setPermissions(staffMember.permissions || [])
  }

  const handlePermissionToggle = (permission) => {
    setPermissions(prev =>
      prev.includes(permission) ? prev.filter(p => p !== permission) : [...prev, permission]
    )
  }

  const handleSave = () => {
    if (selectedStaff) {
      updateMutation.mutate({ staffId: selectedStaff.id, permissions })
    }
  }

  const permissionCategories = {
    'Order Management': ['view_orders', 'create_order', 'update_order_status', 'cancel_order', 'verify_order'],
    'Table Management': ['view_tables', 'assign_tables', 'update_table_status', 'manage_reservations'],
    'Menu Access': ['view_menu', 'create_menu_item', 'edit_menu_item', 'delete_menu_item'],
    'Customer Management': ['view_customers', 'add_customer', 'edit_customer'],
    'Reports': ['view_reports', 'export_reports'],
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Individual Permissions</h3>
        <p className="text-sm text-gray-500">Set custom permissions for each staff member</p>
      </div>

      <div className="p-5">
        <Select
          label="Select Staff Member"
          value={selectedStaff?.id || ''}
          onChange={(e) => {
            const staffMember = staff.find(s => s.id === e.target.value)
            handleStaffSelect(staffMember)
          }}
          options={[
            { value: '', label: '-- Select Staff Member --' },
            ...(staff?.map(s => ({ value: s.id, label: `${s.name} (${s.role})` })) || []),
          ]}
        />

        {selectedStaff && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-6"
          >
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <UserIcon className="w-8 h-8 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{selectedStaff.name}</p>
                <p className="text-sm text-gray-500">Role: {selectedStaff.role}</p>
              </div>
            </div>

            {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
              <div key={category}>
                <h4 className="font-medium text-gray-800 mb-3">{category}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categoryPermissions.map((permission) => (
                    <label key={permission} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.includes(permission)}
                        onChange={() => handlePermissionToggle(permission)}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-sm text-gray-700 capitalize">{permission.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button onClick={handleSave} isLoading={updateMutation.isLoading} icon={ShieldCheckIcon}>
                Save Permissions
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default PermissionManager