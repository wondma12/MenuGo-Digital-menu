import {useState} from 'react'
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
import { useAuthStore } from '../../../store/authStore'
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
      const currentUser = useAuthStore.getState().user
      const force = currentUser?.role === 'platform_admin'
      await deleteUser(user.id, { force })
      toast.success('User deleted successfully')
      onUpdate()
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const roleColors = {
    platform_admin: 'from-violet-500 to-violet-400',
    restaurant_admin: 'from-blue-500 to-blue-400',
    waiter: 'from-emerald-500 to-emerald-400',
    customer: 'from-slate-500 to-slate-400',
    support_agent: 'from-orange-500 to-amber-400',
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
        className={`min-h-[220px] overflow-hidden rounded-none border border-slate-100 border-l-4 border-l-slate-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl`}
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <Avatar src={user.avatar} name={user.fullName} size="xl" />
              <div>
                <Link to={`/platform/users/${user.id}`}>
                  <h3 className="text-lg font-black tracking-tight text-slate-900 hover:text-orange-600">
                    {user.fullName}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`${user.role === 'restaurant_admin' ? 'text-blue-600' : 'text-slate-900'} font-semibold text-sm`}
                    style={user.role === 'platform_admin' ? { color: 'rgb(107 33 168 / var(--tw-text-opacity, 1))' } : undefined}
                  >
                    {user.role?.replace('_', ' ')}
                  </div>
                  <span
                    className={`rounded-none px-2 py-0.5 text-sm font-semibold ${user.isActive ? 'text-emerald-600' : 'text-slate-600'}`}
                    style={!user.isActive ? { color: 'rgb(217 119 6 / var(--tw-text-opacity, 1))' } : undefined}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {user.emailVerified && (
                    <Badge variant="success" size="sm" className="rounded-none bg-blue-50 text-blue-700 ring-1 ring-blue-100">Verified</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 pr-1">
              <button
                onClick={() => (window.location.href = `/platform/users/${user.id}`)}
                title="View"
                className="rounded-none p-1 text-slate-500 hover:text-orange-600"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => (window.location.href = `/platform/users/${user.id}/edit`)}
                title="Edit"
                className="rounded-none p-1 text-slate-500 hover:text-orange-600"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStatusChange(!user.isActive)}
                title={user.isActive ? 'Deactivate' : 'Activate'}
                className={`rounded-none p-1 ${user.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
              >
                {user.isActive ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleRoleChange('platform_admin')}
                title="Make Admin"
                disabled={user.role === 'platform_admin'}
                className="rounded-none p-1 text-slate-500 hover:text-orange-600 disabled:opacity-40"
              >
                <ShieldCheckIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                title="Delete"
                className="rounded-none p-1 text-slate-500 hover:text-rose-600"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 text-base text-slate-600">
              <EnvelopeIcon className="w-5 h-5 text-orange-400" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3 text-base text-slate-600">
                <PhoneIcon className="w-5 h-5 text-blue-400" />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-base text-slate-600">
              <CalendarIcon className="w-5 h-5 text-emerald-400" />
              <span>
                Joined {
                  (() => {
                    const d = user.createdAt ?? user.created_at ?? user.created_at
                    const date = d ? new Date(d) : null
                    return date && !isNaN(date) ? date.toLocaleDateString() : 'Unknown'
                  })()
                }
              </span>
            </div>
          </div>

          {user.lastLogin && (
            <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
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