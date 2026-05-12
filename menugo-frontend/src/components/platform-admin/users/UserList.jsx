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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage all users on the platform</p>
            <div className="mt-2">
              <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">Showing admins only</span>
            </div>
        </div>
        <Button onClick={() => navigate('/platform/users/new')} icon={UserPlusIcon}>
          Add User
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 text-black"
        >
          <FunnelIcon className="w-5 h-5 text-black" />
          <span className="text-black">Filters</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6">
          <UserFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500">Total Admins</p>
          <p className="text-2xl font-bold text-gray-900">{adminData?.total ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Active Admins</p>
          <p className="text-2xl font-bold text-green-600">{adminData?.active ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 border-l-4 border-l-yellow-500">
          <p className="text-sm text-gray-500">Pending Verification</p>
          <p className="text-2xl font-bold text-yellow-600">{adminData?.pendingVerification ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500">New This Month</p>
          <p className="text-2xl font-bold text-blue-600">{adminData?.newThisMonth ?? 0}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
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