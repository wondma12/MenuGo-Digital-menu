import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  TicketIcon,
  ChartBarIcon,
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
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() })
  
  const { data, isLoading } = useQuery(
    ['platformDashboard', dateRange],
    () => getPlatformDashboardData(dateRange),
    { refetchInterval: 30000 }
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
      title: 'Total Revenue',
      value: `$${data?.totalRevenue?.toLocaleString() || 0}`,
      icon: CurrencyDollarIcon,
      trend: data?.revenueGrowth || 0,
      trendValue: '+15%',
      color: 'purple'
    },
    {
      title: 'Total Orders',
      value: data?.totalOrders?.toLocaleString() || 0,
      icon: ShoppingBagIcon,
      trend: data?.ordersGrowth || 0,
      trendValue: '+10%',
      color: 'orange'
    },
    {
      title: 'Open Tickets',
      value: data?.openTickets || 0,
      icon: TicketIcon,
      trend: data?.ticketsTrend || 0,
      trendValue: '-5%',
      color: 'red'
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your entire platform performance</p>
        </div>
        <QuickActions />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={data?.revenueData || []} />
        <RestaurantGrowthChart data={data?.growthData || []} />
      </div>

      {/* Metrics & Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PlatformMetrics data={data?.metrics || {}} />
        </div>
        <div>
          <SystemHealth health={data?.systemHealth || {}} />
        </div>
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentRestaurants restaurants={data?.recentRestaurants || []} />
        <RecentOrders orders={data?.recentOrders || []} />
      </div>

      {/* Alerts Section */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">System Alerts</h3>
          </div>
          <div className="space-y-2">
            {data.alerts.map((alert, index) => (
              <div key={index} className="text-sm text-yellow-700">
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