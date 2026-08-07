import {useState} from 'react'
import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import { useAuthStore } from '../../../store/authStore'
import { startOfMonth, endOfMonth } from 'date-fns'
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  TicketIcon,
  ServerIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import StatsCard from './StatCard'
import RevenueChart from './RevenueChart'
import RestaurantGrowthChart from './RestaurantGrowthChart'
import RecentRestaurants from './RecentRestaurants'
import RecentOrders from './RecentOrders'
import PlatformMetrics from './PlatformMetrics'
import SystemHealth from './SystemHealth'
import QuickActions from './QuickActions'
import Loading from '../../common/Loading'
import { getPlatformDashboardData } from '../../../services/analyticsService'

const PlatformDashboard = () => {
  // Default to the current month so charts reflect the selected month range
  const now = new Date()
  const defaultStart = startOfMonth(now)
  const defaultEnd = endOfMonth(now)
  const [dateRange, setDateRange] = useState({ start: defaultStart, end: defaultEnd })
  
  const authToken = useAuthStore((state) => state.token) || (typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null) || (typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null) || (typeof window !== 'undefined' ? window.localStorage.getItem('token') : null)
  const { data, isLoading } = useQuery(
    ['platformDashboard', dateRange, authToken],
    () => getPlatformDashboardData(dateRange),
    {
      refetchInterval: 30000,
      enabled: Boolean(authToken),
    }
  )

  if (isLoading) return <Loading />

  const stats = [
    {
      title: 'Total Restaurants',
      value: data?.totalRestaurants || 0,
      icon: BuildingOfficeIcon,
      trend: data?.restaurantsGrowth || 0,
      trendValue: '+12%',
      color: 'blue'
    },
    {
      title: 'Active Users',
      value: data?.activeUsers || 0,
      icon: UserGroupIcon,
      trend: data?.usersGrowth || 0,
      trendValue: '+8%',
      color: 'green'
    },
    {
      title: 'Pending Verification',
      value: data?.pendingVerification || 0,
      icon: ExclamationTriangleIcon,
      trend: undefined,
      trendValue: '',
      color: 'yellow'
    },
    {
      title: 'Platform Health',
      value: `${data?.platformHealth || 100}%`,
      icon: ServerIcon,
      trend: data?.healthTrend || 0,
      trendValue: '+2%',
      color: 'teal'
    }
  ]

  return (
    <div className="relative space-y-6 overflow-visible bg-white p-4 sm:px-6 lg:px-8 font-['Manrope',system-ui,sans-serif] text-slate-900">
      {/* <div className="relative z-30 overflow-visible rounded-none border border-orange-100 bg-white p-5 pb-10 shadow-sm sm:p-6 sm:pb-12 lg:p-7 lg:pb-12"> */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,146,60,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.08),transparent_55%)]" />
        <div className="relative z-40 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            {/* <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Platform overview</p> */}
            <h1 className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Platform Dashboard</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">Overview of your entire platform performance</p>
          </div>
          <div className="relative z-50">
            <QuickActions />
          </div>
        </div>
      {/* </div> */}

      {/* Stats Grid: use same columns as restaurant dashboard for consistent card sizes */}
      <div className="relative z-10 -mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 sm:-mt-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="relative z-10 flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500">Note: totals and chart counts reflect completed orders only.</p>
      </div>
      {/* <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"> */}
        <RevenueChart data={data?.revenueData || []} />
        <RestaurantGrowthChart data={data?.growthData || []} />
      {/* </div> */}

      {/* Metrics & Health Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PlatformMetrics data={data || {}} />
        </div>
        <div>
          <SystemHealth health={data?.systemHealth || {}} />
        </div>
      </div>

      {/* Recent Activity Row */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentRestaurants restaurants={data?.recentRestaurants || []} />
        <RecentOrders orders={data?.recentOrders || []} />
      </div> */}

      {/* Alerts Section */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900">System Alerts</h3>
          </div>
          <div className="space-y-2">
            {data.alerts.map((alert, index) => (
              <div key={index} className="text-sm text-slate-600">
                • {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PlatformDashboard