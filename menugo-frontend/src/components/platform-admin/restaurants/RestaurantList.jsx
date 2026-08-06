import {useState} from 'react'
import { useQuery } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import RestaurantCard from './RestaurantCard'
import RestaurantFilters from './RestaurantFilters'
import Loading from '../../../common/Loading'
import EmptyState from '../../../common/EmptyState'
import Pagination from '../../../common/Pagination'
import { getRestaurants } from '../../../services/restaurantService'



const RestaurantList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    tier: 'all',
    country: 'all',
    dateRange: null,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading, error, refetch } = useQuery(
    ['restaurants', currentPage, searchTerm, filters],
    () => getRestaurants({ page: currentPage, search: searchTerm, ...filters }),
    { keepPreviousData: true }
  )

  if (isLoading) return <Loading />

  if (error) return (
    <div className="relative space-y-6 overflow-visible bg-white p-4 text-slate-900 sm:p-6 lg:p-8 font-['Manrope',system-ui,sans-serif]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,146,60,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.08),transparent_55%)]" />
      <div className="relative">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h3 className="text-lg font-semibold text-red-900">Failed to load restaurants</h3>
          <p className="mt-2 text-red-800">{error?.message || 'Please try again or contact support'}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative space-y-6 overflow-visible bg-white p-4 text-slate-900 sm:p-6 lg:p-8 font-['Manrope',system-ui,sans-serif]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,146,60,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.08),transparent_55%)]" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Platform restaurants</p>
            <h1 className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Restaurant Management</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">Manage all restaurants on the platform</p>
          </div>
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        {[
          { label: 'Total Restaurants', value: data?.total || 0, textClass: 'text-slate-900', borderClass: 'border-l-blue-500' },
          { label: 'Active', value: data?.active || 0, textClass: 'text-emerald-600', borderClass: 'border-l-emerald-500' },
          { label: 'Pending Verification', value: data?.pending || 0, textClass: 'text-amber-600', borderClass: 'border-l-amber-500' },
          { label: 'Pending Upgrade Requests', value: data?.pendingUpgradeRequests || 0, textClass: 'text-cyan-600', borderClass: 'border-l-cyan-500' },
          { label: 'Premium', value: data?.premium || 0, textClass: 'text-violet-600', borderClass: 'border-l-violet-500' },
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

      {/* Restaurant Grid */}
      {data?.restaurants?.length === 0 ? (
        <EmptyState
          title="No restaurants found"
          description="Try adjusting your search or filters"
          icon={MagnifyingGlassIcon}
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 lg:grid">
              <div>Restaurant</div>
              <div>Contact</div>
              <div>Stats</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>

            <div className="divide-y divide-slate-100">
            {data?.restaurants?.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white"
              >
                <RestaurantCard restaurant={restaurant} onUpdate={refetch} variant="list" />
              </motion.div>
            ))}
            </div>
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