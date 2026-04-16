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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Revenue Analytics</h2>
          <p className="text-sm text-gray-500">Detailed revenue analysis</p>
        </div>
        <div className="flex gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportReport data={data} type="revenue" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total Revenue" value={`$${data?.totalRevenue?.toLocaleString() || 0}`} trend={data?.revenueTrend} />
        <KpiCard title="Avg Daily Revenue" value={`$${data?.avgDailyRevenue?.toLocaleString() || 0}`} trend={data?.dailyTrend} />
        <KpiCard title="Highest Revenue Day" value={`$${data?.highestRevenueDay?.amount || 0}`} subtitle={data?.highestRevenueDay?.date} />
        <KpiCard title="Growth Rate" value={`${data?.growthRate || 0}%`} trend={data?.growthRateTrend} isPositive={data?.growthRate > 0} />
      </div>

      {/* Revenue vs Orders Chart */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Orders</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={data?.revenueVsOrders || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="revenue" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.3} name="Revenue" />
            <Bar yAxisId="right" dataKey="orders" fill="#10b981" name="Orders" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Payment Method</h3>
          <div className="space-y-3">
            {data?.paymentMethods?.map((method) => (
              <div key={method.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-${method.color}-500`} />
                  <span className="text-sm text-gray-700 capitalize">{method.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">${method.amount.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">{method.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Order Type</h3>
          <div className="space-y-3">
            {data?.orderTypes?.map((type) => (
              <div key={type.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{type.name}</span>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full bg-${type.color}-500 rounded-full`} style={{ width: `${type.percentage}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{type.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const KpiCard = ({ title, value, trend, subtitle, isPositive }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-200">
    <p className="text-xs text-gray-500">{title}</p>
    <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
    {trend && (
      <p className={`text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from previous
      </p>
    )}
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
)

export default RevenueAnalytics