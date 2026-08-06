import {useState} from 'react'
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
    <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 p-5">
        <h3 className="text-lg font-black tracking-tight text-slate-900">Individual Permissions</h3>
        <p className="text-sm text-slate-500">Set custom permissions for each staff member</p>
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
            <div className="flex items-center gap-3 rounded-none bg-slate-50 p-3">
              <UserIcon className="w-8 h-8 text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">{selectedStaff.name}</p>
                <p className="text-sm text-slate-500">Role: {selectedStaff.role}</p>
              </div>
            </div>

            {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
              <div key={category}>
                <h4 className="mb-3 font-semibold text-slate-700">{category}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categoryPermissions.map((permission) => (
                    <label key={permission} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.includes(permission)}
                        onChange={() => handlePermissionToggle(permission)}
                        className="h-4 w-4 rounded-none text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-slate-600 capitalize">{permission.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end border-t border-slate-100 pt-4">
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