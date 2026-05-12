import React, { useState } from 'react'
import { useQuery } from 'react-query'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
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
import Loading from '../../../common/Loading'
import { getPlatformAnalytics, getPlatformDashboardData } from '../../../services/analyticsService'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const PlatformAnalytics = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  })

  const { data, isLoading } = useQuery(
    ['platformAnalytics', dateRange],
    // Use the richer dashboard API which aggregates restaurants, users, orders and revenue
    () => getPlatformDashboardData(dateRange)
  )

  if (isLoading) return <Loading />

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-500 mt-1">Comprehensive platform performance metrics</p>
        </div>
        <div className="flex gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportReport data={data} dateRange={dateRange} />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Revenue" value={`$${(data?.totalRevenue || 0).toLocaleString()}`} change={data?.revenueGrowth} />
        <MetricCard title="Active Restaurants" value={data?.activeRestaurants || 0} change={data?.restaurantsGrowth} />
        <MetricCard title="Active Users" value={(data?.activeUsers || 0).toLocaleString()} change={data?.usersGrowth} />
        <MetricCard title="Total Orders" value={(data?.totalOrders || 0).toLocaleString()} change={data?.ordersGrowth} />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data?.revenueData || []}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revenueGradient)" />
            <Line type="monotone" dataKey="orders" stroke="#10b981" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.growthData || data?.restaurantGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="new" fill="#3b82f6" />
              <Bar dataKey="total" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                // Prefer explicit userDistribution if provided by the API, otherwise
                // attempt to build a simple distribution from `metrics.role_breakdown`
                data={data?.userDistribution || data?.metrics?.role_breakdown || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(data?.userDistribution || data?.metrics?.role_breakdown || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subscription Distribution */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data?.subscriptionDistribution || data?.subscriptionBreakdown || []} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="tier" type="category" />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const MetricCard = ({ title, value, change }) => {
  const key = (title || '').toLowerCase()
  let borderClass = 'border-l-blue-500'
  if (key.includes('revenue')) borderClass = 'border-l-purple-500'
  else if (key.includes('active')) borderClass = 'border-l-blue-500'
  else if (key.includes('users')) borderClass = 'border-l-green-500'
  else if (key.includes('orders')) borderClass = 'border-l-orange-500'

  return (
    <div className={`bg-white rounded-xl p-4 border border-gray-200 border-l-4 ${borderClass}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {change !== undefined && (
        <p className={`text-xs mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change}% from previous period
        </p>
      )}
    </div>
  )
}

export default PlatformAnalytics