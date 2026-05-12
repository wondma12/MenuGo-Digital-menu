import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  StarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import DateRangePicker from './DateRangePicker'
import ExportReport from './ExportReport'
import { useAuthStore } from '../../../store/authStore'
import Loading from '../../../common/Loading'
import { getRestaurantAnalytics } from '../../../services/analyticsService'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const RestaurantAnalytics = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  })

  const { user } = useAuthStore()
  const restaurantId = user?.restaurant_id?.id || user?.restaurant_id || user?.restaurant?.id || user?.restaurant?._id

  const { data, isLoading } = useQuery(
    ['restaurantAnalytics', restaurantId, dateRange],
    () => getRestaurantAnalytics(restaurantId, dateRange),
    { enabled: !!restaurantId }
  )

  if (!restaurantId) return (
    <div className="p-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-gray-700">No restaurant selected. Please select a restaurant to view analytics.</p>
      </div>
    </div>
  )

  if (isLoading) return <Loading />

  const metrics = [
    {
      title: 'Total Revenue',
      value: `$${data?.totalRevenue?.toLocaleString() || 0}`,
      change: data?.revenueChange || 0,
      icon: CurrencyDollarIcon,
      color: 'green',
    },
    {
      title: 'Total Orders',
      value: data?.totalOrders?.toLocaleString() || 0,
      change: data?.ordersChange || 0,
      icon: ShoppingBagIcon,
      color: 'blue',
    },
    {
      title: 'Avg Order Value',
      value: `$${data?.avgOrderValue?.toFixed(2) || 0}`,
      change: data?.avgOrderChange || 0,
      icon: ArrowTrendingUpIcon,
      color: 'purple',
    },
    {
      title: 'Customer Satisfaction',
      value: `${data?.avgRating || 0}/5`,
      change: data?.ratingChange || 0,
      icon: StarIcon,
      color: 'yellow',
    },
  ]

  const borderColors = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    purple: 'border-l-purple-500',
    yellow: 'border-l-yellow-500',
    red: 'border-l-red-500',
    orange: 'border-l-orange-500',
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Track your restaurant performance</p>
        </div>
        <div className="flex gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportReport data={data} dateRange={dateRange} />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-xl p-5 border border-gray-200 border-l-4 ${borderColors[metric.color] || 'border-l-blue-500'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-${metric.color}-100`}>
                <metric.icon className={`w-5 h-5 text-${metric.color}-600`} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change >= 0 ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
                {Math.abs(metric.change)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            <p className="text-sm text-gray-500 mt-1">{metric.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue & Orders Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data?.revenueData || []}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.ordersData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Order Type Distribution & Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Type Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.orderTypeDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                dataKey="value"
              >
                {(data?.orderTypeDistribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Hours</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.peakHours || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Categories & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {data?.topCategories?.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-${COLORS[index % COLORS.length]}-500`} />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">{category.orders} orders</span>
                  <span className="text-sm text-gray-500">{category.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {data?.paymentMethods?.map((method, index) => (
              <div key={method.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{method.name}</span>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${COLORS[index % COLORS.length]}-500 rounded-full`}
                      style={{ width: `${method.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{method.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RestaurantAnalytics
