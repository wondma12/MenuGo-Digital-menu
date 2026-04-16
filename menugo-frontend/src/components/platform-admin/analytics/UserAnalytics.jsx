import React, { useState } from 'react'
import { useQuery } from 'react-query'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { getUserAnalytics } from '../../../services/analyticsService'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const UserAnalytics = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  })

  const { data, isLoading } = useQuery(
    ['userAnalytics', dateRange],
    () => getUserAnalytics(dateRange)
  )

  if (isLoading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">User Analytics</h2>
          <p className="text-sm text-gray-500">User growth and engagement metrics</p>
        </div>
        <div className="flex gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportReport data={data} type="users" />
        </div>
      </div>

      {/* User Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UserMetricCard title="Total Users" value={data?.totalUsers?.toLocaleString() || 0} change={data?.userGrowth} />
        <UserMetricCard title="Active Users" value={data?.activeUsers?.toLocaleString() || 0} change={data?.activeGrowth} />
        <UserMetricCard title="New Users" value={data?.newUsers?.toLocaleString() || 0} change={data?.newUserGrowth} />
        <UserMetricCard title="Retention Rate" value={`${data?.retentionRate || 0}%`} change={data?.retentionChange} />
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data?.userGrowthData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total Users" />
            <Line type="monotone" dataKey="new" stroke="#10b981" strokeWidth={2} name="New Users" />
            <Line type="monotone" dataKey="active" stroke="#f59e0b" strokeWidth={2} name="Active Users" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User by Role</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data?.roleDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                dataKey="value"
              >
                {(data?.roleDistribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
          <div className="space-y-3">
            {data?.topCountries?.slice(0, 5).map((country, index) => (
              <div key={country.code} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm text-gray-700">{country.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">{country.count.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">{country.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <EngagementMetric label="Avg Session Duration" value={`${data?.avgSessionDuration || 0}m`} />
          <EngagementMetric label="Avg Orders per User" value={data?.avgOrdersPerUser || 0} />
          <EngagementMetric label="Returning Users" value={`${data?.returningRate || 0}%`} />
          <EngagementMetric label="Churn Rate" value={`${data?.churnRate || 0}%`} isNegative={data?.churnRate > 10} />
        </div>
      </div>
    </div>
  )
}

const UserMetricCard = ({ title, value, change }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-200">
    <p className="text-xs text-gray-500">{title}</p>
    <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
    {change !== undefined && (
      <p className={`text-xs mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
      </p>
    )}
  </div>
)

const EngagementMetric = ({ label, value, isNegative }) => (
  <div className="p-3 bg-gray-50 rounded-lg text-center">
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`text-lg font-bold ${isNegative ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
  </div>
)

export default UserAnalytics