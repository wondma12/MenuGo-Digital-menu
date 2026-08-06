import {useState} from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import DateRangePicker from './DateRangePicker'
import ExportReport from './ExportReport'
import Loading from '../../../common/Loading'
import { getCustomerReport } from '../../../services/analyticsService'
import { formatPrice } from '../../../utils/currency'

const CustomerReport = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  })

  const { data, isLoading } = useQuery(
    ['customerReport', dateRange],
    () => getCustomerReport(dateRange)
  )

  if (isLoading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Customer Report</h2>
          <p className="text-sm text-gray-500">Customer behavior and retention analysis</p>
        </div>
        <div className="flex gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportReport data={data} type="customers" dateRange={dateRange} />
        </div>
      </div>

      {/* Customer Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900">{data?.totalCustomers || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">New Customers</p>
          <p className="text-2xl font-bold text-green-600">{data?.newCustomers || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Returning Customers</p>
          <p className="text-2xl font-bold text-blue-600">{data?.returningCustomers || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Retention Rate</p>
          <p className="text-2xl font-bold text-gray-900">{data?.retentionRate || 0}%</p>
        </div>
      </div>

      {/* Customer Growth */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Growth</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data?.customerGrowth || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total Customers" />
            <Line type="monotone" dataKey="new" stroke="#10b981" strokeWidth={2} name="New Customers" />
            <Line type="monotone" dataKey="returning" stroke="#f59e0b" strokeWidth={2} name="Returning" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Customer Segmentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segmentation</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">One-time (0 orders)</span>
                <span className="text-sm font-medium text-gray-900">{data?.oneTimeCustomers || 0}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data?.oneTimePercent || 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Regular (2-5 orders)</span>
                <span className="text-sm font-medium text-gray-900">{data?.regularCustomers || 0}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${data?.regularPercent || 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Loyal (5+ orders)</span>
                <span className="text-sm font-medium text-gray-900">{data?.loyalCustomers || 0}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${data?.loyalPercent || 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
          <div className="space-y-3">
            {data?.topCustomers?.map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-xs text-gray-500">{customer.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{customer.orders} orders</p>
                  <p className="text-xs text-gray-500">{formatPrice(customer.totalSpent)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Average Order Value by Customer Type */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Order Value by Customer Type</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data?.avgOrderByType || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis tickFormatter={(value) => formatPrice(value)} />
            <Tooltip />
            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default CustomerReport