import React, { useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import UserFilters from './UserFilters'
import Loading from '../../../common/Loading'
import EmptyState from '../../../common/EmptyState'
import Pagination from '../../../common/Pagination'
import Button from '../../../common/Button'
import Badge from '../../../common/Badge'
import Dropdown from '../../../common/Dropdown'
import Avatar from '../../../common/Avatar'
import { updateUserStatus, deleteUser } from '../../../services/userService'
import { useAuthStore } from '../../../store/authStore'
import toast from 'react-hot-toast'
import { getUsers } from '../../../services/userService'

const UserList = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  // Default to showing all user roles (platform, restaurant, waiter, customer, support)
  // Default to show only admin accounts (platform_admin + restaurant_admin)
  const [filters, setFilters] = useState({
    role: 'platform_admin,restaurant_admin',
    status: 'all',
    verification: 'all',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const roleColors = useMemo(() => ({
    platform_admin: 'from-violet-500 to-violet-400',
    restaurant_admin: 'from-blue-500 to-blue-400',
    waiter: 'from-emerald-500 to-emerald-400',
    chef: 'from-cyan-500 to-cyan-400',
    manager: 'from-sky-500 to-sky-400',
    admin: 'from-slate-600 to-slate-500',
    cashier: 'from-amber-500 to-amber-400',
    delivery: 'from-lime-500 to-lime-400',
    customer: 'from-slate-500 to-slate-400',
    support_agent: 'from-orange-500 to-amber-400',
  }), [])

  const getDisplayRole = (user) => {
    if (user.displayRole) return user.displayRole
    if (Array.isArray(user.staff_assignments) && user.staff_assignments.length > 0) {
      return user.staff_assignments[0].role
    }
    return user.role
  }

  const { data, isLoading, refetch } = useQuery(
    ['users', currentPage, searchTerm, filters],
    () => getUsers({ page: currentPage, search: searchTerm, ...filters }),
    { keepPreviousData: true }
  )

  // Fetch summary counts for admin accounts only (platform_admin + restaurant_admin)
  const { data: adminData } = useQuery(
    ['users', 'admins', 'summary'],
    () => getUsers({ role: 'platform_admin,restaurant_admin', page: 1, limit: 1 }),
    { staleTime: 5 * 60 * 1000 }
  )

  const formatDate = (value) => {
    if (!value) return 'Unknown'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString()
  }

  const formatDateTime = (value) => {
    if (!value) return 'Never'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? 'Never' : date.toLocaleString()
  }

  const formatRoleLabel = (role) => role?.replace(/_/g, ' ')
  const getDisplayRoleLabel = (user) => formatRoleLabel(getDisplayRole(user))

  const handleStatusChange = async (user, status) => {
    try {
      await updateUserStatus(user.id, { isActive: status })
      toast.success(`User ${status ? 'activated' : 'deactivated'} successfully`)
      refetch()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (user) => {
    try {
      const currentUser = useAuthStore.getState().user
      const force = currentUser?.role === 'platform_admin'
      await deleteUser(user.id, { force })
      toast.success('User deleted successfully')
      refetch()
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const buildMenuItems = (user) => [
    {
      label: 'View Details',
      icon: EyeIcon,
      onClick: () => navigate(`/platform/users/${user.id}`),
    },
    {
      label: 'Edit User',
      icon: PencilIcon,
      onClick: () => navigate(`/platform/users/${user.id}/edit`),
    },
    {
      label: user.isActive ? 'Deactivate' : 'Activate',
      icon: user.isActive ? XCircleIcon : CheckCircleIcon,
      onClick: () => handleStatusChange(user, !user.isActive),
    },
    {
      label: 'Delete',
      icon: TrashIcon,
      onClick: () => handleDelete(user),
      danger: true,
    },
  ]

  const renderStatusBadge = (user) => (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant="primary"
        size="sm"
        className={`rounded-none bg-gradient-to-r ${roleColors[getDisplayRole(user)] || roleColors.customer} text-white ring-1 ring-slate-100`}
      >
        {getDisplayRoleLabel(user)}
      </Badge>
      <Badge
        variant={user.isActive ? 'success' : 'danger'}
        size="sm"
        className={user.isActive ? 'rounded-none bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'rounded-none bg-rose-50 text-rose-700 ring-1 ring-rose-100'}
      >
        {user.isActive ? 'Active' : 'Inactive'}
      </Badge>
      {user.emailVerified && (
        <Badge variant="success" size="sm" className="rounded-none bg-blue-50 text-blue-700 ring-1 ring-blue-100">Verified</Badge>
      )}
    </div>
  )

  if (isLoading) return <Loading />

  return (
    <div className="relative space-y-6 overflow-visible bg-white p-4 sm:px-6 lg:px-8 font-['Manrope',system-ui,sans-serif] text-slate-900 sm:p-6 lg:p-8">
      {/* <div className="relative overflow-hidden rounded-none border border-orange-100 bg-white p-5 shadow-sm sm:p-6 lg:p-7"> */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,146,60,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.08),transparent_55%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Platform users</p>
            <h1 className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">User Management</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">Manage all users on the platform</p>
            <div className="mt-3 inline-flex items-center rounded-none bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">Showing admins only</div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => navigate('/platform/users/new')} icon={UserPlusIcon} className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 px-4 py-2">Add User</Button>
          </div>
        </div>
      {/* </div> */}

      

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-none border border-slate-200 bg-white py-3 pl-12 pr-4 text-slate-900 shadow-sm outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 rounded-none border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50"
        >
          <FunnelIcon className="h-5 w-5 text-orange-500" />
          <span>Filters</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div>
          <UserFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Total Admins', value: adminData?.total ?? 0, textClass: 'text-slate-900', borderClass: 'border-l-blue-500' },
          { label: 'Active Admins', value: adminData?.active ?? 0, textClass: 'text-emerald-600', borderClass: 'border-l-emerald-500' },
          { label: 'Pending Verification', value: adminData?.pendingVerification ?? 0, textClass: 'text-amber-600', borderClass: 'border-l-amber-500' },
          { label: 'New This Month', value: adminData?.newThisMonth ?? 0, textClass: 'text-blue-600', borderClass: 'border-l-blue-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.08, duration: 0.35, ease: 'easeOut' }}
            whileHover={{ y: -3 }}
            className={`flex h-24 items-center justify-between rounded-2xl border border-slate-100 border-l-4 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${stat.borderClass}`}
          >
            <div>
              <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.textClass}`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* User List */}
      {data?.users?.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try adjusting your search or filters"
          icon={MagnifyingGlassIcon}
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden grid-cols-[2.4fr_1.6fr_1fr_0.9fr_1.1fr_72px] gap-4 border-b border-slate-200 bg-slate-50 px-2 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 lg:grid">
              <div>User</div>
              <div>Contact</div>
              <div>Role</div>
              <div>Status</div>
              <div>Joined</div>
              <div className="text-right">Actions</div>
            </div>

            <div className="divide-y divide-slate-100">
              {data?.users?.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="grid gap-4 px-2 py-4 lg:grid-cols-[2.4fr_1.6fr_1fr_0.9fr_1.1fr_72px] lg:items-center lg:px-2"
                >
                  <div className="flex items-start gap-3">
                    <Avatar src={user.avatar} name={user.fullName} size="md" />
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => navigate(`/platform/users/${user.id}`)}
                        className="text-left text-base font-black tracking-tight text-slate-900 hover:text-orange-600"
                      >
                        {user.fullName}
                      </button>
                      <div className="mt-2 lg:hidden">
                        <div
                          className={`text-sm ${getDisplayRole(user) === 'restaurant_admin' ? 'text-blue-600' : 'text-slate-600'}`}
                          style={getDisplayRole(user) === 'platform_admin' ? { color: 'rgb(107 33 168 / var(--tw-text-opacity, 1))' } : undefined}
                        >
                          {getDisplayRoleLabel(user)}
                        </div>
                        <div
                          className={`text-sm ${user.isActive ? 'text-emerald-600' : 'text-slate-600'}`}
                          style={!user.isActive ? { color: 'rgb(217 119 6 / var(--tw-text-opacity, 1))' } : undefined}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-slate-600">
                    <div className="truncate">{user.email}</div>
                  </div>

                  <div
                    className={`text-sm hidden lg:block ${getDisplayRole(user) === 'restaurant_admin' ? 'text-blue-600' : 'text-slate-600'}`}
                    style={getDisplayRole(user) === 'platform_admin' ? { color: 'rgb(107 33 168 / var(--tw-text-opacity, 1))' } : undefined}
                  >
                    {getDisplayRoleLabel(user)}
                  </div>

                  <div
                    className={`text-sm ${user.isActive ? 'text-emerald-600' : 'text-slate-600'}`}
                    style={!user.isActive ? { color: 'rgb(217 119 6 / var(--tw-text-opacity, 1))' } : undefined}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </div>

                  <div className="text-sm text-slate-600">{formatDate(user.createdAt)}</div>



                  <div className="flex justify-end items-center space-x-1 pr-0">
                    <button
                      onClick={() => navigate(`/platform/users/${user.id}`)}
                      title="View"
                      className="rounded-none p-1 text-slate-500 hover:text-orange-600"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/platform/users/${user.id}/edit`)}
                      title="Edit"
                      className="rounded-none p-1 text-slate-500 hover:text-orange-600"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(user, !user.isActive)}
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                      className={`rounded-none p-1 ${user.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                    >
                      {user.isActive ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      title="Delete"
                      className="rounded-none p-1 text-slate-500 hover:text-rose-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {data?.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={data.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default UserList