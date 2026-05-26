import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, FunnelIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import UserCard from './UserCard'
import UserFilters from './UserFilters'
import Loading from '../../../common/Loading'
import EmptyState from '../../../common/EmptyState'
import Pagination from '../../../common/Pagination'
import Button from '../../../common/Button'
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

  if (isLoading) return <Loading />

  return (
    <div className="space-y-6 bg-white p-4 font-['Manrope',system-ui,sans-serif] text-slate-900 sm:p-6 lg:p-8">
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
            <Button onClick={() => navigate('/platform/users/new')} icon={UserPlusIcon} className="rounded-none bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 px-4 py-2">Add User</Button>
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
        <div className="flex h-24 items-center justify-between rounded-none border border-slate-100 border-l-4 border-l-orange-500 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Admins</p>
            <p className="text-2xl font-black text-slate-900">{adminData?.total ?? 0}</p>
          </div>
        </div>
        <div className="flex h-24 items-center justify-between rounded-none border border-slate-100 border-l-4 border-l-emerald-500 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-500">Active Admins</p>
            <p className="text-2xl font-black text-emerald-600">{adminData?.active ?? 0}</p>
          </div>
        </div>
        <div className="flex h-24 items-center justify-between rounded-none border border-slate-100 border-l-4 border-l-amber-500 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-500">Pending Verification</p>
            <p className="text-2xl font-black text-amber-600">{adminData?.pendingVerification ?? 0}</p>
          </div>
        </div>
        <div className="flex h-24 items-center justify-between rounded-none border border-slate-100 border-l-4 border-l-blue-500 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-500">New This Month</p>
            <p className="text-2xl font-black text-blue-600">{adminData?.newThisMonth ?? 0}</p>
          </div>
        </div>
      </div>

      {/* User Grid */}
      {data?.users?.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try adjusting your search or filters"
          icon={MagnifyingGlassIcon}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
            {data?.users?.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <UserCard user={user} onUpdate={refetch} />
              </motion.div>
            ))}
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