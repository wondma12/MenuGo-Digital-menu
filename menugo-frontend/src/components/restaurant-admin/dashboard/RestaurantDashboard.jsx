import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import { useAuthStore } from '../../../store/authStore'
import { startOfMonth, endOfMonth } from 'date-fns'
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  StarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import DashboardMetrics from './DashboardMetrics'
import RevenueChart from './RevenueChart'
import OrdersChart from './OrdersChart'
import PopularItemsChart from './PopularItemsChart'
import QuickActions from './QuickActions'
import TodaySchedule from './TodaySchedule'
import Loading from '../../common/Loading'
import Alert from '../../common/Alert'
import DateRangePicker from '../analytics/DateRangePicker'
import { getRestaurantDashboardData } from '../../../services/restaurantService'
import { formatPrice } from '../../../utils/currency'

const RestaurantDashboard = () => {
  const { user } = useAuthStore()
  // Normalize restaurant id from user object (accept string or nested object)
  const restaurantId = user?.restaurant_id?.id || user?.restaurant_id || user?.restaurant?.id || user?.restaurant?._id
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  })

  const { data, isLoading, error, refetch } = useQuery(
    ['restaurantDashboard', dateRange, restaurantId],
    () => getRestaurantDashboardData({
      restaurantId,
      startDate: dateRange.start,
      endDate: dateRange.end
    }),
    { 
      refetchInterval: 30000,
      enabled: !!restaurantId,
      retry: 1
    }
  )

  if (isLoading) return <Loading />

  if (error || !data) {
    return (
      <div className="p-6">
        <Alert
          type="warning"
          title="Unable to Load Dashboard"
          message={error?.message || 'Could not load dashboard data. Please try again later.'}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const metrics = [
    // Use aggregated values for the selected date range so metrics reflect picker
    {
      title: 'Orders',
      value: (data?.ordersData || []).reduce((s, p) => s + Number(p.orders || 0), 0) || (data?.todayOrders || 0),
      change: data?.ordersChange || 0,
      color: 'blue',
    },
    {
      title: 'Completed',
      value: data?.completedTotal || data?.completedToday || 0,
      change: 0,
      color: 'teal',
    },
    {
      title: 'Revenue',
      value: formatPrice((data?.revenueData || []).reduce((s, p) => s + Number(p.revenue || 0), 0) || (data?.todayRevenue || 0)),
      change: data?.revenueChange || 0,
      color: 'orange',
    },
    {
      title: 'Avg Rating',
      value: `${data?.avgRating || 0}/5`,
      change: data?.ratingChange || 0,
      color: 'yellow',
    },
  ]

  return (
    <div className="relative overflow-hidden space-y-6 bg-white p-4 sm:p-6 lg:p-8 font-['Manrope',system-ui,sans-serif] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.08),transparent_35%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Restaurant dashboard</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Restaurant Dashboard</h1>
            <p className="text-sm leading-6 text-slate-500 sm:text-base">Welcome back, {user?.full_name?.split(' ')?.[0] || ''}! Here&apos;s your business overview.</p>
          </div>
          <div className="relative z-50 flex items-center gap-2">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <QuickActions restaurantId={restaurantId} />
          </div>
        </div>

      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <DashboardMetrics {...metric} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
        <RevenueChart data={data?.revenueData || []} />
        <OrdersChart data={data?.ordersData || []} />
      {/* </div> */}

      {/* Popular Items & Today Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularItemsChart items={data?.popularItems || []} />
        <TodaySchedule schedule={data?.todaySchedule || {}} />
      </div>

    </div>
  )
}

export default RestaurantDashboard