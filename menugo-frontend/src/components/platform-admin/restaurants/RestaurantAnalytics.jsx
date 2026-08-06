import {useState} from 'react'
import { useQuery } from 'react-query'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { CalendarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import DatePicker from '../../../common/DatePicker'
import Loading from '../../../common/Loading'
import Button from '../../../common/Button'
import { getRestaurantAnalytics } from '../../../services/analyticsService'
import { formatPrice } from '../../../utils/currency'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const RestaurantAnalytics = ({ restaurantId }) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  })

  const { data, isLoading } = useQuery(
    ['restaurantAnalytics', restaurantId, dateRange],
    () => getRestaurantAnalytics(restaurantId, dateRange)
  )

  if (isLoading) return <Loading />

  const handleExport = () => {
    // Export analytics data
    const exportData = {
      orders: data?.ordersData,
      revenue: data?.revenueData,
      popularItems: data?.popularItems,
      dateRange,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `restaurant_analytics_${restaurantId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Analytics Overview</h3>
          <p className="text-sm text-gray-500">Restaurant performance metrics</p>
        </div>
        <div className="flex gap-3">
          <DatePicker
            selected={dateRange.start}
            onChange={(date) => setDateRange({ ...dateRange, start: date })}
            placeholderText="Start Date"
          />
          <DatePicker
            selected={dateRange.end}
            onChange={(date) => setDateRange({ ...dateRange, end: date })}
            placeholderText="End Date"
          />
          <Button variant="outline" onClick={handleExport} icon={ArrowDownTrayIcon}>
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Orders"
          value={data?.totalOrders?.toLocaleString() || 0}
          change={data?.ordersChange}
        />
        <MetricCard
          title="Total Revenue"
          value={formatPrice(data?.totalRevenue || 0)}
          change={data?.revenueChange}
        />
        <MetricCard
          title="Average Order Value"
          value={formatPrice(data?.avgOrderValue || 0)}
          change={data?.avgOrderChange}
        />
        <MetricCard
          title="Customer Satisfaction"
          value={`${data?.avgRating || 0}/5`}
          change={data?.ratingChange}
        />
      </div>

      {/* Orders Trend */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Orders Trend</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data?.ordersData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Revenue by Order Type</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.revenueByType || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(data?.revenueByType || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Items */}
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Popular Items</h4>
          <div className="space-y-3">
            {data?.popularItems?.slice(0, 5).map((item, index) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded" />
                  )}
                  <span className="text-sm text-gray-900">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{item.orders} orders</span>
                  <span className="text-sm font-semibold text-gray-900">${item.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Distribution */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Orders by Hour</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data?.hourlyData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const MetricCard = ({ title, value, change }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-200">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
    {change !== undefined && (
      <p className={`text-xs mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change >= 0 ? '+' : ''}{change}% from previous period
      </p>
    )}
  </div>
)

export default RestaurantAnalytics
