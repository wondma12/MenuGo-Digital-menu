import React, { useState } from 'react'
import { useQuery } from 'react-query'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
} from 'recharts'
import DateRangePicker from './DateRangePicker'
import ExportReport from './ExportReport'
import Loading from '../../../common/Loading'
import { getRevenueAnalytics } from '../../../services/analyticsService'
import { formatPrice } from '../../../utils/currency'

const RevenueAnalytics = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    end: new Date(),
  })

  const { data, isLoading } = useQuery(
    ['revenueAnalytics', dateRange],
    () => getRevenueAnalytics(dateRange)
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
                Revenue Analytics
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Revenue analytics</h2>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">Detailed revenue analysis with clean, high-contrast chart cards.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <DateRangePicker value={dateRange} onChange={setDateRange} />
              <ExportReport data={data} type="revenue" dateRange={dateRange} />
            </div>
          </div>
        </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard title="Total Revenue" value={formatPrice(data?.totalRevenue || 0)} trend={data?.revenueTrend} />
        <KpiCard title="Avg Daily Revenue" value={formatPrice(data?.avgDailyRevenue || 0)} trend={data?.dailyTrend} />
        <KpiCard title="Highest Revenue Day" value={formatPrice(data?.highestRevenueDay?.amount || 0)} subtitle={data?.highestRevenueDay?.date} />
        <KpiCard title="Growth Rate" value={`${data?.growthRate || 0}%`} trend={data?.growthRateTrend} isPositive={data?.growthRate > 0} />
      </div>

      {/* Revenue vs Orders Chart */}
      <div className="rounded-3xl border border-orange-100 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Revenue vs Orders</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={data?.revenueVsOrders || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} />
            <YAxis yAxisId="left" stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ color: '#475569' }} />
            <Area yAxisId="left" type="monotone" dataKey="revenue" fill="#f97316" stroke="#f97316" fillOpacity={0.25} name="Revenue" />
            <Bar yAxisId="right" dataKey="orders" fill="#3b82f6" name="Orders" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-orange-100 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Revenue by Payment Method</h3>
          <div className="space-y-3">
            {data?.paymentMethods?.map((method) => (
              <div key={method.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full bg-${method.color}-500`} />
                  <span className="text-sm capitalize text-slate-700">{method.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-900">{formatPrice(method.amount)}</span>
                  <span className="text-sm text-slate-500">{method.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-orange-100 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Revenue by Order Type</h3>
          <div className="space-y-3">
            {data?.orderTypes?.map((type) => (
              <div key={type.name} className="flex items-center justify-between">
                <span className="text-sm capitalize text-slate-700">{type.name}</span>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full rounded-full bg-${type.color}-500`} style={{ width: `${type.percentage}%` }} />
                  </div>
                  <span className="text-sm font-medium text-slate-900">{type.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

const KpiCard = ({ title, value, trend, subtitle, isPositive }) => (
  <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
    <p className="text-xs font-medium text-slate-500">{title}</p>
    <p className="mt-1 text-xl font-black tracking-tight text-slate-900">{value}</p>
    {trend && (
      <p className={`mt-1 text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from previous
      </p>
    )}
    {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
  </div>
)

export default RevenueAnalytics