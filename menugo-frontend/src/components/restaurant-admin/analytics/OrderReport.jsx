import { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import {
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
import Loading from '../../../common/Loading'
import { getOrderReport } from '../../../services/analyticsService'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

const OrderReport = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  })

  const { data, isLoading } = useQuery(
    ['orderReport', dateRange],
    () => getOrderReport(dateRange)
  )

  if (isLoading) return <Loading />

  const statusCounts = data?.statusDistribution?.reduce((acc, curr) => {
    acc[curr.name] = curr.value
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Order Report</h2>
          <p className="text-sm text-gray-500">Order volume and status analysis</p>
        </div>
        <div className="flex gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportReport data={data} type="orders" dateRange={dateRange} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{data?.totalOrders || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{statusCounts?.completed || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{statusCounts?.cancelled || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900">{data?.completionRate || 0}%</p>
        </div>
      </div>

      {/* Order Trends */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Trends</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data?.orderTrends || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="Total Orders" />
            <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Completed" />
            <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} name="Cancelled" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Status Distribution & Order Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.statusDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                dataKey="value"
              >
                {(data?.statusDistribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Type</h3>
          <div className="space-y-4">
            {data?.orderTypeDistribution?.map((type, index) => (
              <div key={type.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm text-gray-700 capitalize">{type.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">{type.value} orders</span>
                  <span className="text-sm text-gray-500">{type.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Average Order Time */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Order Processing Time</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Order to Verify</p>
            <p className="text-xl font-bold text-gray-900">{data?.avgVerifyTime || 0} min</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Verify to Prepare</p>
            <p className="text-xl font-bold text-gray-900">{data?.avgPrepStartTime || 0} min</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Preparation Time</p>
            <p className="text-xl font-bold text-gray-900">{data?.avgPrepTime || 0} min</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Processing</p>
            <p className="text-xl font-bold text-gray-900">{data?.totalProcessingTime || 0} min</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderReport