import {useState} from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import DateRangePicker from './DateRangePicker'
import ExportReport from './ExportReport'
import ReportFilters from './ReportFilters'
import Loading from '../../../common/Loading'
import { getSalesReport } from '../../../services/analyticsService'
import { formatPrice } from '../../../utils/currency'

const SalesReport = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  })
  const [filters, setFilters] = useState({
    groupBy: 'day',
    category: 'all',
    paymentMethod: 'all',
  })

  const { data, isLoading } = useQuery(
    ['salesReport', dateRange, filters],
    () => getSalesReport({ dateRange, ...filters })
  )

  if (isLoading) return <Loading />

  const totalSales = data?.salesData?.reduce((sum, item) => sum + item.revenue, 0) || 0
  const totalOrders = data?.salesData?.reduce((sum, item) => sum + item.orders, 0) || 0
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Sales Report</h2>
          <p className="text-sm text-gray-500">Detailed sales analysis</p>
        </div>
        <div className="flex gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportReport data={data} type="sales" dateRange={dateRange} />
        </div>
      </div>

      <ReportFilters filters={filters} onFiltersChange={setFilters} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(totalSales)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{totalOrders.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Average Order Value</p>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(averageOrderValue)}</p>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data?.salesData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis yAxisId="left" tickFormatter={(value) => formatPrice(value)} />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Revenue" />
            <Bar yAxisId="right" dataKey="orders" fill="#3b82f6" name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Breakdown Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Daily Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Order Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Top Item</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.dailyBreakdown?.map((day, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-sm text-gray-900">{day.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{day.orders}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatPrice(day.revenue)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatPrice(day.avgOrderValue)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{day.topItem || '-'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SalesReport