import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'
import Dropdown from '../../../common/Dropdown'
import ConfirmationDialog from '../../../common/ConfirmationDialog'
import Avatar from '../../../common/Avatar'
import { updateUserStatus, deleteUser } from '../../../services/userService'
import toast from 'react-hot-toast'

const UserCard = ({ user, onUpdate }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleStatusChange = async (status) => {
    try {
      await updateUserStatus(user.id, { isActive: status })
      toast.success(`User ${status ? 'activated' : 'deactivated'} successfully`)
      onUpdate()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleRoleChange = async (role) => {
    try {
      await updateUserStatus(user.id, { role })
      toast.success(`User role updated to ${role}`)
      onUpdate()
    } catch (error) {
      toast.error('Failed to update role')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteUser(user.id)
      toast.success('User deleted successfully')
      onUpdate()
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const roleColors = {
    platform_admin: 'purple',
    restaurant_admin: 'blue',
    waiter: 'green',
    customer: 'gray',
    support_agent: 'orange',
  }

  const menuItems = [
    {
      label: 'View Details',
      icon: EyeIcon,
      onClick: () => window.location.href = `/platform/users/${user.id}`,
    },
    {
      label: 'Edit User',
      icon: PencilIcon,
      onClick: () => window.location.href = `/platform/users/${user.id}/edit`,
    },
    {
      label: user.isActive ? 'Deactivate' : 'Activate',
      icon: user.isActive ? XCircleIcon : CheckCircleIcon,
      onClick: () => handleStatusChange(!user.isActive),
    },
    {
      label: 'Make Admin',
      icon: ShieldCheckIcon,
      onClick: () => handleRoleChange('platform_admin'),
      disabled: user.role === 'platform_admin',
    },
    {
      label: 'Delete',
      icon: TrashIcon,
      onClick: () => setShowDeleteDialog(true),
      danger: true,
    },
  ]

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
      >
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <Avatar src={user.avatar} name={user.fullName} size="lg" />
              <div>
                <Link to={`/platform/users/${user.id}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-primary-600">
                    {user.fullName}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={roleColors[user.role]} size="sm">
                    {user.role?.replace('_', ' ')}
                  </Badge>
                  <Badge variant={user.isActive ? 'success' : 'danger'} size="sm">
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {user.emailVerified && (
                    <Badge variant="success" size="sm">Verified</Badge>
                  )}
                </div>
              </div>
            </div>
            <Dropdown
              trigger={
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <EllipsisVerticalIcon className="w-4 h-4 text-gray-600" />
                </button>
              }
              items={menuItems}
              align="right"
            />
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <EnvelopeIcon className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <PhoneIcon className="w-4 h-4" />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarIcon className="w-4 h-4" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {user.lastLogin && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
              Last login: {new Date(user.lastLogin).toLocaleString()}
            </div>
          )}
        </div>
      </motion.div>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${user.fullName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  )
}

export default UserCard