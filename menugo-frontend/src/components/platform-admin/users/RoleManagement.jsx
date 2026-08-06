import {useState} from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Button from '../../../common/Button'
import Loading from '../../../common/Loading'
import { getRoles, updateRolePermissions } from '../../../services/userService'
import toast from 'react-hot-toast'

const RoleManagement = () => {
  const [editingRole, setEditingRole] = useState(null)
  const [editedPermissions, setEditedPermissions] = useState([])
  const queryClient = useQueryClient()

  const { data: roles, isLoading } = useQuery('roles', getRoles)

  const updateMutation = useMutation(updateRolePermissions, {
    onSuccess: () => {
      queryClient.invalidateQueries('roles')
      setEditingRole(null)
      toast.success('Permissions updated successfully')
    },
    onError: () => {
      toast.error('Failed to update permissions')
    },
  })

  if (isLoading) return <Loading />

  const permissionGroups = {
    'Restaurant Management': ['view_restaurants', 'create_restaurant', 'edit_restaurant', 'delete_restaurant', 'verify_restaurant'],
    'User Management': ['view_users', 'create_user', 'edit_user', 'delete_user', 'manage_roles'],
    'Order Management': ['view_orders', 'create_order', 'edit_order', 'delete_order', 'verify_order'],
    'Menu Management': ['view_menu', 'create_menu', 'edit_menu', 'delete_menu'],
    'Analytics': ['view_analytics', 'export_reports', 'view_dashboard'],
    'Support': ['view_tickets', 'create_ticket', 'resolve_ticket', 'manage_knowledge_base'],
    'System': ['view_settings', 'edit_settings', 'view_logs', 'manage_backup'],
  }

  const handleEdit = (role) => {
    setEditingRole(role)
    setEditedPermissions(role.permissions || [])
  }

  const handlePermissionToggle = (permission) => {
    setEditedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    )
  }

  const handleSave = () => {
    updateMutation.mutate({ roleId: editingRole.id, permissions: editedPermissions })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
        <p className="text-gray-500 mt-1">Configure role-based permissions</p>
      </div>

      <div className="space-y-6">
        {roles?.map((role) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 capitalize">{role.name}</h3>
                <p className="text-sm text-gray-500">{role.description}</p>
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

            <div className="p-5">
              {Object.entries(permissionGroups).map(([groupName, permissions]) => (
                <div key={groupName} className="mb-6 last:mb-0">
                  <h4 className="font-medium text-gray-800 mb-3">{groupName}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {permissions.map((permission) => {
                      const isChecked = editingRole?.id === role.id
                        ? editedPermissions.includes(permission)
                        : role.permissions?.includes(permission)
                      return (
                        <label key={permission} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => editingRole?.id === role.id && handlePermissionToggle(permission)}
                            disabled={editingRole?.id !== role.id}
                            className="w-4 h-4 text-primary-600 rounded"
                          />
                          <span className="text-sm text-gray-700 capitalize">
                            {permission.replace(/_/g, ' ')}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default RoleManagement
