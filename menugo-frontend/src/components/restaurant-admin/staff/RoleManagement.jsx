import {useState} from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Button from '../../../common/Button'
import Loading from '../../../common/Loading'
import { getRoles, updateRolePermissions } from '../../../services/staffService'
import toast from 'react-hot-toast'

const RoleManagement = () => {
  const [editingRole, setEditingRole] = useState(null)
  const [editedPermissions, setEditedPermissions] = useState([])
  const queryClient = useQueryClient()

  const { data: roles, isLoading } = useQuery('staffRoles', getRoles)

  const updateMutation = useMutation(updateRolePermissions, {
    onSuccess: () => {
      queryClient.invalidateQueries('staffRoles')
      setEditingRole(null)
      toast.success('Permissions updated successfully')
    },
    onError: () => toast.error('Failed to update permissions'),
  })

  if (isLoading) return <Loading />

  const permissionGroups = {
    'Orders': ['view_orders', 'create_order', 'update_order_status', 'cancel_order', 'verify_order'],
    'Menu': ['view_menu', 'create_menu_item', 'edit_menu_item', 'delete_menu_item'],
    'Tables': ['view_tables', 'assign_tables', 'update_table_status', 'manage_reservations'],
    'Staff': ['view_staff', 'manage_staff', 'manage_roles'],
    'Reports': ['view_reports', 'export_reports'],
    'Settings': ['view_settings', 'edit_settings'],
  }

  const handleEdit = (role) => {
    setEditingRole(role)
    setEditedPermissions(role.permissions || [])
  }

  const handlePermissionToggle = (permission) => {
    setEditedPermissions(prev =>
      prev.includes(permission) ? prev.filter(p => p !== permission) : [...prev, permission]
    )
  }

  const handleSave = () => {
    updateMutation.mutate({ roleId: editingRole.id, permissions: editedPermissions })
  }

  const roleColors = {
    admin: 'bg-purple-100 border-purple-200',
    manager: 'bg-blue-100 border-blue-200',
    waiter: 'bg-green-100 border-green-200',
    chef: 'bg-orange-100 border-orange-200',
    cashier: 'bg-cyan-100 border-cyan-200',
    delivery: 'bg-indigo-100 border-indigo-200',
  }

  return (
    <div className="space-y-6">
      {roles?.map((role) => (
        <motion.div
          key={role.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-none border p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] ${roleColors[role.name] || 'bg-slate-100 border-slate-200'}`}
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 capitalize">{role.name}</h3>
              <p className="text-sm text-slate-500">{role.description}</p>
            </div>
            {editingRole?.id === role.id ? (
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm" icon={CheckIcon}>Save</Button>
                <Button onClick={() => setEditingRole(null)} variant="secondary" size="sm" icon={XMarkIcon}>Cancel</Button>
              </div>
            ) : (
              <Button onClick={() => handleEdit(role)} variant="outline" size="sm" icon={PencilIcon}>Edit</Button>
            )}
          </div>

          {editingRole?.id === role.id ? (
            <div className="space-y-4">
              {Object.entries(permissionGroups).map(([groupName, permissions]) => (
                <div key={groupName}>
                  <h4 className="mb-2 font-semibold text-slate-700">{groupName}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {permissions.map((permission) => (
                      <label key={permission} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editedPermissions.includes(permission)}
                          onChange={() => handlePermissionToggle(permission)}
                          className="h-4 w-4 rounded-none text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm text-slate-600 capitalize">{permission.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {role.permissions?.slice(0, 10).map((perm) => (
                <span key={perm} className="rounded-none bg-white px-2 py-1 text-xs text-slate-600">
                  {perm.replace(/_/g, ' ')}
                </span>
              ))}
              {role.permissions?.length > 10 && (
                <span className="rounded-none bg-white px-2 py-1 text-xs text-slate-600">
                  +{role.permissions.length - 10} more
                </span>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

export default RoleManagement
