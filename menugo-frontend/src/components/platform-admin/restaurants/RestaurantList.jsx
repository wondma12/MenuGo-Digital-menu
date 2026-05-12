import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlassIcon, PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'
import RestaurantCard from './RestaurantCard'
import RestaurantFilters from './RestaurantFilters'
import Loading from '../../../common/Loading'
import EmptyState from '../../../common/EmptyState'
import Pagination from '../../../common/Pagination'
import { getRestaurants } from '../../../services/restaurantService'
import { useNavigate } from 'react-router-dom';



const RestaurantList = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    tier: 'all',
    country: 'all',
    dateRange: null,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading, refetch } = useQuery(
    ['restaurants', currentPage, searchTerm, filters],
    () => getRestaurants({ page: currentPage, search: searchTerm, ...filters }),
    { keepPreviousData: true }
  )

  if (isLoading) return <Loading />

  return (
    <div className="p-4 sm:p-6">
     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Management</h1>
          <p className="text-gray-500 mt-1">Manage all restaurants on the platform</p>
        </div>
        {/* <button
          onClick={() => navigate('/platform/restaurants/create')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <PlusIcon className="w-5 h-5" />
          Create Restaurant
        </button> */}
      </div>
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
          <input
            type="text"
            placeholder="Search restaurants by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2"
        >
          <FunnelIcon className="w-5 h-5 text-black" />
          <span className="text-black">Filters</span>
          {(filters.status !== 'all' || filters.tier !== 'all' || filters.country !== 'all') && (
            <span className="w-2 h-2 bg-primary-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <RestaurantFilters filters={filters} onFiltersChange={setFilters} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500">Total Restaurants</p>
          <p className="text-2xl font-bold text-gray-900">{data?.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{data?.active || 0}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 border-l-4 border-l-yellow-500">
          <p className="text-sm text-gray-500">Pending Verification</p>
          <p className="text-2xl font-bold text-yellow-600">{data?.pending || 0}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 border-l-4 border-l-purple-500">
          <p className="text-sm text-gray-500">Premium</p>
          <p className="text-2xl font-bold text-purple-600">{data?.premium || 0}</p>
        </div>
      </div>

      {/* Restaurant Grid */}
      {data?.restaurants?.length === 0 ? (
        <EmptyState
          title="No restaurants found"
          description="Try adjusting your search or filters"
          icon={MagnifyingGlassIcon}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.restaurants?.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <RestaurantCard restaurant={restaurant} onUpdate={refetch} />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
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

export default RestaurantList