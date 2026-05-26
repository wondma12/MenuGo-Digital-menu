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
    <div className="space-y-6 bg-white p-4 font-['Manrope',system-ui,sans-serif] text-slate-900 sm:p-6 lg:p-8">
      <button onClick={() => navigate('/platform/users')} className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-orange-600">
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Users
      </button>

      <div className="overflow-hidden rounded-none border border-orange-100 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex items-start gap-6">
            <Avatar src={user.avatar} name={user.fullName} size="xl" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">User profile</p>
                  <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">{user.fullName}</h1>
                  <p className="text-slate-500">@{user.email}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={user.isActive ? 'success' : 'danger'} size="md" className={user.isActive ? 'rounded-none bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'rounded-none bg-rose-50 text-rose-700 ring-1 ring-rose-100'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {user.emailVerified && <Badge variant="success" size="md" className="rounded-none bg-blue-50 text-blue-700 ring-1 ring-blue-100">Email Verified</Badge>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <InfoItem icon={EnvelopeIcon} label="Email" value={user.email || 'Not provided'} />
                <InfoItem icon={PhoneIcon} label="Phone" value={user.phone || 'Not provided'} />
                <InfoItem icon={CalendarIcon} label="Joined" value={(() => {
                  const d = user.createdAt ?? user.created_at ?? user.created_at
                  const date = d ? new Date(d) : null
                  return date && !isNaN(date) ? date.toLocaleDateString() : 'Unknown'
                })()} />
                <InfoItem icon={ShieldCheckIcon} label="Role" value={user.role?.replace('_', ' ') || 'N/A'} />
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
          className="inline-flex items-center gap-2 rounded-none bg-gradient-to-r from-orange-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:from-orange-600 hover:to-blue-600"
        >
          <PencilIcon className="w-4 h-4" />
          Edit User
        </button>

        <button
          onClick={() => setShowStatusDialog(true)}
          className={`inline-flex items-center gap-2 rounded-none px-4 py-2 text-sm font-semibold transition-colors ${user.isActive ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
        >
          {user.isActive ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
          {user.isActive ? 'Deactivate' : 'Activate'}
        </button>

        <button
          onClick={() => setShowDeleteDialog(true)}
          className="inline-flex items-center gap-2 rounded-none bg-gradient-to-r from-rose-500 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:from-rose-600 hover:to-red-600"
        >
          <TrashIcon className="w-4 h-4" />
          Delete User
        </button>

        <button onClick={() => navigate('/platform/users')} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-orange-600">
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
    {Icon && <Icon className="w-4 h-4 mt-0.5 text-orange-400" />}
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm text-slate-900">{value}</p>
    </div>
  </div>
)

const OverviewTab = ({ user }) => (
  <div className="space-y-6">
    <div className="rounded-none border border-orange-100 bg-white p-6 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Account</p>
      <h3 className="mb-4 mt-1 text-lg font-black text-slate-900">Account Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500">User ID</p>
          <p className="text-sm font-mono text-slate-900">{user.id}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Created At</p>
          <p className="text-sm text-slate-900">{(() => {
            const d = user.createdAt ?? user.created_at ?? user.created_at
            const date = d ? new Date(d) : null
            return date && !isNaN(date) ? date.toLocaleString() : 'Unknown'
          })()}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Last Updated</p>
          <p className="text-sm text-slate-900">{(() => {
            const d = user.updatedAt ?? user.updated_at ?? user.updated_at
            const date = d ? new Date(d) : null
            return date && !isNaN(date) ? date.toLocaleString() : 'Unknown'
          })()}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Login Attempts</p>
          <p className="text-sm text-slate-900">{user.loginAttempts ?? user.login_attempts ?? 0}</p>
        </div>
      </div>
    </div>
  </div>
)

const ActivityLogTab = ({ userId }) => {
  const { data: logs } = useQuery(['userActivity', userId], () => getUserActivityLogs(userId))
  return (
    <div className="rounded-none border border-orange-100 bg-white p-6 shadow-sm">
      <div className="space-y-3">
        {logs?.map((log, index) => (
          <div key={index} className="flex items-start gap-3 rounded-none bg-orange-50/40 p-3">
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
  <div className="rounded-none border border-orange-100 bg-white p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Permissions</h3>
    <div className="space-y-2">
      {getPermissionsForRole(user.role).map((perm, index) => (
        <div key={index} className="flex items-center gap-2 rounded-none bg-orange-50/40 p-2">
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