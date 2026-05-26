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

const COLORS = ['#3b82f6', '#f97316', '#10b981', '#eab308', '#ef4444', '#ec4899']

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
    <div className="relative overflow-hidden bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.1),transparent_32%)]" />
      <div className="relative mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-orange-100 bg-white/95 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-gradient-to-r from-orange-100 to-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                User Analytics
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">User analytics</h2>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">User growth and engagement metrics.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <DateRangePicker value={dateRange} onChange={setDateRange} />
              <ExportReport data={data} type="users" dateRange={dateRange} />
            </div>
          </div>
        </div>

      {/* User Metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <UserMetricCard title="Total Users" value={data?.totalUsers?.toLocaleString() || 0} change={data?.userGrowth} />
        <UserMetricCard title="Active Users" value={data?.activeUsers?.toLocaleString() || 0} change={data?.activeGrowth} />
        <UserMetricCard title="New Users" value={data?.newUsers?.toLocaleString() || 0} change={data?.newUserGrowth} />
        <UserMetricCard title="Retention Rate" value={`${data?.retentionRate || 0}%`} change={data?.retentionChange} />
      </div>

      {/* User Growth Chart */}
      <div className="rounded-3xl border border-orange-100 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">User Growth</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data?.userGrowthData || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} />
            <YAxis stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ color: '#475569' }} />
            <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total Users" />
            <Line type="monotone" dataKey="new" stroke="#f97316" strokeWidth={2} name="New Users" />
            <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={2} name="Active Users" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-orange-100 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">User by Role</h3>
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

        <div className="rounded-3xl border border-orange-100 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Top Countries</h3>
          <div className="space-y-3">
            {data?.topCountries?.slice(0, 5).map((country, index) => (
              <div key={country.code} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm text-slate-700">{country.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-900">{country.count.toLocaleString()}</span>
                  <span className="text-sm text-slate-500">{country.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="rounded-3xl border border-orange-100 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">User Engagement</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <EngagementMetric label="Avg Session Duration" value={`${data?.avgSessionDuration || 0}m`} />
          <EngagementMetric label="Avg Orders per User" value={data?.avgOrdersPerUser || 0} />
          <EngagementMetric label="Returning Users" value={`${data?.returningRate || 0}%`} />
          <EngagementMetric label="Churn Rate" value={`${data?.churnRate || 0}%`} isNegative={data?.churnRate > 10} />
        </div>
      </div>
      </div>
    </div>
  )
}

const UserMetricCard = ({ title, value, change }) => (
  <div className="flex h-24 items-center justify-between rounded-3xl border border-orange-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{value}</p>
    </div>
    {change !== undefined && (
      <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
        {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
      </div>
    )}
  </div>
)

const EngagementMetric = ({ label, value, isNegative }) => (
  <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-blue-50 p-3 text-center">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className={`text-lg font-black ${isNegative ? 'text-rose-600' : 'text-slate-900'}`}>{value}</p>
  </div>
)

export default UserAnalytics