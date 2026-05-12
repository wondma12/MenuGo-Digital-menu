import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, CalendarIcon, ShieldCheckIcon, PencilIcon, XCircleIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline'
import Loading from '../../../common/Loading'
import Badge from '../../../common/Badge'
import Avatar from '../../../common/Avatar'
import Tabs from '../../../common/Tabs'
import ConfirmationDialog from '../../../common/ConfirmationDialog'
import toast from 'react-hot-toast'
import { getUserDetails, deleteUser, updateUserStatus } from '../../../services/userService'

const UserDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)

  const { data: user, isLoading } = useQuery(['user', id], () => getUserDetails(id))

  if (isLoading) return <Loading />

  const tabs = [
    { label: 'Overview', content: <OverviewTab user={user} /> },
    { label: 'Activity Log', content: <ActivityLogTab userId={id} /> },
    { label: 'Permissions', content: <PermissionsTab user={user} /> },
  ]

  return (
    <div className="p-6">
      <button onClick={() => navigate('/platform/users')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Users
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-start gap-6">
            <Avatar src={user.avatar} name={user.fullName} size="xl" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
                  <p className="text-gray-500">@{user.email}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={user.isActive ? 'success' : 'danger'} size="md">
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {user.emailVerified && <Badge variant="success" size="md">Email Verified</Badge>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <InfoItem icon={EnvelopeIcon} label="Email" value={user.email} />
                <InfoItem icon={PhoneIcon} label="Phone" value={user.phone || 'Not provided'} />
                <InfoItem icon={CalendarIcon} label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
                <InfoItem icon={ShieldCheckIcon} label="Role" value={user.role?.replace('_', ' ')} />
                <InfoItem label="Last Login" value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'} />
                <InfoItem label="2FA" value={user.twoFactorEnabled ? 'Enabled' : 'Disabled'} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(`/platform/users/${user.id}/edit`)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <PencilIcon className="w-4 h-4" />
          Edit User
        </button>

        <button
          onClick={() => setShowStatusDialog(true)}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${user.isActive ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
        >
          {user.isActive ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
          {user.isActive ? 'Deactivate' : 'Activate'}
        </button>

        <button
          onClick={() => setShowDeleteDialog(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <TrashIcon className="w-4 h-4" />
          Delete User
        </button>

        <button onClick={() => navigate('/platform/users')} className="px-4 py-2 text-gray-600 hover:text-gray-900">
          Back
        </button>
      </div>

      <Tabs tabs={tabs} />

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete User"
        message={`Are you sure you want to delete "${user.fullName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        onConfirm={async () => {
          try {
            await deleteUser(user.id)
            toast.success('User deleted')
            navigate('/platform/users')
          } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to delete user')
          }
        }}
      />

      <ConfirmationDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        title={`${user.isActive ? 'Deactivate' : 'Activate'} User`}
        message={`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} "${user.fullName}"?`}
        confirmText={user.isActive ? 'Deactivate' : 'Activate'}
        variant={user.isActive ? 'danger' : 'primary'}
        onConfirm={async () => {
          try {
            await updateUserStatus(user.id, { isActive: !user.isActive })
            toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`)
            setShowStatusDialog(false)
            navigate('/platform/users')
          } catch (err) {
            toast.error('Failed to update status')
          }
        }}
      />
    </div>
  )
}

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2">
    {Icon && <Icon className="w-4 h-4 text-gray-400 mt-0.5" />}
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  </div>
)

const OverviewTab = ({ user }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">User ID</p>
          <p className="text-sm font-mono text-gray-900">{user.id}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Created At</p>
          <p className="text-sm text-gray-900">{new Date(user.createdAt).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Last Updated</p>
          <p className="text-sm text-gray-900">{new Date(user.updatedAt).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Login Attempts</p>
          <p className="text-sm text-gray-900">{user.loginAttempts || 0}</p>
        </div>
      </div>
    </div>
  </div>
)

const ActivityLogTab = ({ userId }) => {
  const { data: logs } = useQuery(['userActivity', userId], () => getUserActivityLogs(userId))
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="space-y-3">
        {logs?.map((log, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
            <div className="flex-1">
              <p className="text-sm text-gray-900">{log.action}</p>
              <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
            </div>
            <Badge variant="info" size="sm">{log.entityType}</Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

const PermissionsTab = ({ user }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Permissions</h3>
    <div className="space-y-2">
      {getPermissionsForRole(user.role).map((perm, index) => (
        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          <CheckCircleIcon className="w-4 h-4 text-green-500" />
          <span className="text-sm text-gray-700">{perm}</span>
        </div>
      ))}
    </div>
  </div>
)

const getPermissionsForRole = (role) => {
  const permissions = {
    platform_admin: ['Full System Access', 'Manage All Restaurants', 'Manage All Users', 'View Analytics', 'Manage Subscriptions', 'System Settings'],
    restaurant_admin: ['Manage Own Restaurant', 'Manage Menu', 'View Orders', 'Manage Staff', 'View Analytics', 'Manage Tables'],
    waiter: ['View Orders', 'Update Order Status', 'View Tables', 'Take Orders', 'View Menu'],
    customer: ['View Menu', 'Place Orders', 'View Order History', 'Leave Reviews'],
    support_agent: ['View Tickets', 'Respond to Tickets', 'View Users', 'View Restaurants'],
  }
  return permissions[role] || []
}

export default UserDetails