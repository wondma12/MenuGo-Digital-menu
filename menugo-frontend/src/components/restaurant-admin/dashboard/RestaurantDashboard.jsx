import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import { useAuthStore } from '../../../store/authStore'
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
import RecentOrdersTable from './RecentOrdersTable'
import QuickActions from './QuickActions'
import TodaySchedule from './TodaySchedule'
import LowStockAlert from './LowStockAlert'
import CustomerInsights from './CustomerInsights'
import Loading from '../../common/Loading'
import Alert from '../../common/Alert'
import { getRestaurantDashboardData } from '../../../services/restaurantService'

const RestaurantDashboard = () => {
  const { user } = useAuthStore()
  // Normalize restaurant id from user object (accept string or nested object)
  const restaurantId = user?.restaurant_id?.id || user?.restaurant_id || user?.restaurant?.id || user?.restaurant?._id
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(),
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
    {
      title: 'Today\'s Orders',
      value: data?.todayOrders || 0,
      change: data?.ordersChange || 0,
      icon: ShoppingBagIcon,
      color: 'blue',
    },
    {
      title: 'Today\'s Revenue',
      value: `$${data?.todayRevenue?.toLocaleString() || 0}`,
      change: data?.revenueChange || 0,
      icon: CurrencyDollarIcon,
      color: 'green',
    },
    {
      title: 'Active Customers',
      value: data?.activeCustomers || 0,
      change: data?.customersChange || 0,
      icon: UsersIcon,
      color: 'purple',
    },
    {
      title: 'Avg Rating',
      value: `${data?.avgRating || 0}/5`,
      change: data?.ratingChange || 0,
      icon: StarIcon,
      color: 'yellow',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.full_name?.split(' ')[0]}! Here's your business overview</p>
        </div>
        <QuickActions restaurantId={restaurantId} />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={data?.revenueData || []} />
        <OrdersChart data={data?.ordersData || []} />
      </div>

      {/* Popular Items & Today Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularItemsChart items={data?.popularItems || []} />
        <TodaySchedule schedule={data?.todaySchedule || {}} />
      </div>

      {/* Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockAlert items={data?.lowStockItems || []} />
        <CustomerInsights insights={data?.customerInsights || {}} />
      </div>

      {/* Recent Orders Table */}
      <RecentOrdersTable orders={data?.recentOrders || []} />
    </div>
  )
}

export default RestaurantDashboard