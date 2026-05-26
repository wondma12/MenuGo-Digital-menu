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
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import DateRangePicker from '../analytics/DateRangePicker'
import Loading from '../../../common/Loading'
import Button from '../../../common/Button'
import { getRevenueReport } from '../../../services/subscriptionService'
import { exportToCSV, exportToPDF } from '../../../utils/exportUtils'
import toast from 'react-hot-toast'
import { formatPrice } from '../../../utils/currency'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const RevenueReport = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  })

  const { data, isLoading } = useQuery(
    ['revenueReport', dateRange],
    () => getRevenueReport(dateRange)
  )

  const handleExportCSV = () => {
    try {
      exportToCSV(data?.revenueData || [], 'revenue_report')
      toast.success('CSV exported successfully')
    } catch (error) {
      toast.error('Failed to export CSV')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(data?.revenueData || [], 'revenue_report')
      toast.success('PDF exported successfully')
    } catch (error) {
      toast.error('Failed to export PDF')
    }
  }

  if (isLoading) return <Loading />

  return (
    <div className="space-y-6 bg-white p-4 font-['Manrope',system-ui,sans-serif] text-slate-900 sm:p-6 lg:p-8">
      <div className="relative overflow-hidden rounded-none border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,146,60,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.08),transparent_55%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Subscriptions</p>
            <h1 className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Revenue Report</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">Track platform revenue and subscription metrics</p>
          </div>
          <div className="flex flex-wrap gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button onClick={handleExportCSV} variant="outline" icon={DocumentArrowDownIcon} className="rounded-none border-orange-200 text-orange-600 hover:bg-orange-50">
            CSV
          </Button>
          <Button onClick={handleExportPDF} variant="outline" icon={DocumentArrowDownIcon} className="rounded-none border-orange-200 text-orange-600 hover:bg-orange-50">
            PDF
          </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <SummaryCard
          title="Total Revenue"
          value={formatPrice(data?.totalRevenue || 0)}
          change={data?.revenueChange}
          color="blue"
        />
        <SummaryCard
          title="Subscription Revenue"
          value={formatPrice(data?.subscriptionRevenue || 0)}
          change={data?.subscriptionChange}
          color="green"
        />
        <SummaryCard
          title="MRR"
          value={formatPrice(data?.mrr || 0)}
          change={data?.mrrChange}
          color="purple"
        />
        <SummaryCard
          title="ARR"
          value={formatPrice(data?.arr || 0)}
          change={data?.arrChange}
          color="orange"
        />
      </div>

      {/* Revenue Trend Chart */}
      <div className="rounded-none border border-orange-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data?.revenueTrend || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
            <Line type="monotone" dataKey="subscriptions" stroke="#10b981" strokeWidth={2} name="New Subscriptions" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue by Tier and Plan Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-none border border-orange-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Revenue by Tier</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data?.revenueByTier || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                dataKey="value"
              >
                {(data?.revenueByTier || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-none border border-orange-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.planDistribution || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="plan" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="rounded-none border border-orange-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Monthly Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subscriptions</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Churn Rate</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">LTV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.monthlyBreakdown?.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{item.month}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">${item.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.subscriptions}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={item.churnRate > 5 ? 'text-red-600' : 'text-green-600'}>
                      {item.churnRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">${item.ltv.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const SummaryCard = ({ title, value, change, color }) => (
  <div className="rounded-none border border-orange-100 border-l-4 border-l-orange-500 bg-white p-4 shadow-sm">
    <p className="text-sm text-slate-500">{title}</p>
    <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
    {change !== undefined && (
      <p className={`text-xs mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change >= 0 ? '+' : ''}{change}% from last period
      </p>
    )}
  </div>
)

export default RevenueReport