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
    <div className="space-y-6 bg-white p-4 font-['Manrope',system-ui,sans-serif] text-slate-900 sm:p-6 lg:p-8">
       {/* <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6 lg:p-7"> */}
         <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,146,60,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.08),transparent_55%)]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Platform restaurants</p>
            <h1 className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Restaurant Management</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">Manage all restaurants on the platform</p>
          </div>
      {/* </div> */}
      </div>
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-400" />
          <input
            type="text"
            placeholder="Search restaurants by name, email, or phone..."
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
          {(filters.status !== 'all' || filters.tier !== 'all' || filters.country !== 'all') && (
            <span className="h-2 w-2 rounded-full bg-orange-500" />
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex h-24 items-center justify-between rounded-none border border-slate-100 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Restaurants</p>
            <p className="text-2xl font-black text-slate-900">{data?.total || 0}</p>
          </div>
        </div>
        <div className="flex h-24 items-center justify-between rounded-none border border-slate-100 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-500">Active</p>
            <p className="text-2xl font-black text-emerald-600">{data?.active || 0}</p>
          </div>
        </div>
        <div className="flex h-24 items-center justify-between rounded-none border border-slate-100 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-500">Pending Verification</p>
            <p className="text-2xl font-black text-amber-600">{data?.pending || 0}</p>
          </div>
        </div>
        <div className="flex h-24 items-center justify-between rounded-none border border-slate-100 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-500">Premium</p>
            <p className="text-2xl font-black text-violet-600">{data?.premium || 0}</p>
          </div>
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
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