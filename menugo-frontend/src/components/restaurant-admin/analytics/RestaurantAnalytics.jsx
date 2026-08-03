import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isValid } from 'date-fns'
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  StarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import {
  AreaChart,
  Area,
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
  LabelList,
} from 'recharts'
import DateRangePicker from './DateRangePicker'
import ExportReport from './ExportReport'
import { useAuthStore } from '../../../store/authStore'
import { useNavigate } from 'react-router-dom'
import Loading from '../../../common/Loading'
import { getRestaurantAnalytics } from '../../../services/analyticsService'
import { formatPrice } from '../../../utils/currency'
import { safeParseDate } from '../../../utils/dateUtils'

const COLORS = ['#3b82f6', '#f97316', '#10b981', '#eab308', '#ef4444', '#8b5cf6']

const RestaurantAnalytics = () => {
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  })

  const { user } = useAuthStore()
  // Resolve restaurant id from multiple possible shapes returned by the API/store.
  const resolveRestaurantId = () => {
    if (!user) {
      try {
        const raw = localStorage.getItem('user')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed) return parsed.restaurant_id?.id || parsed.restaurant_id || parsed.restaurant?.id || parsed.restaurant || parsed.restaurant?._id || parsed._id
        }
      } catch (e) {
        // ignore
      }
      return null
    }

    return user.restaurant_id?.id || user.restaurant_id || user.restaurant?.id || user.restaurant || user.restaurant?._id || user._id
  }

  const restaurantId = resolveRestaurantId()

  const navigate = useNavigate()

  const { data, isLoading, error, refetch } = useQuery(
    ['restaurantAnalytics', restaurantId, dateRange],
    () => getRestaurantAnalytics(restaurantId, dateRange),
    { enabled: !!restaurantId, retry: false }
  )

  if (!restaurantId) return (
    <div className="p-6">
      <div className="rounded-none border border-orange-100 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <p className="text-slate-700">No restaurant selected. Please ensure your account is linked to a restaurant or select one in your profile.</p>
        <p className="text-sm text-slate-500 mt-2">If you expect a restaurant to be available, run <code>localStorage.getItem('user')</code> in the console to inspect stored user data.</p>
      </div>
      </div>
  )

  if (isLoading) return <Loading />

  if (error && (error.message === 'auth_required' || error?.response?.status === 401)) {
    return (
      <div className="p-6">
        <div className="rounded-none border border-orange-100 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <p className="text-slate-700">Analytics require you to be logged in as an admin or restaurant user.</p>
          <div className="mt-4">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-500 text-white rounded-none"
            >
              Go to Login
            </button>
            <button
              onClick={() => { refetch() }}
              className="ml-3 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-none"
            >
              Retry
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-2">If you are already logged in, ensure `localStorage.getItem('token')` or a valid session cookie is present.</p>
        </div>
      </div>
    )
  }

  const normalizeSeries = (series, valueKey) => {
    const start = dateRange?.start ? new Date(dateRange.start) : null
    const end = dateRange?.end ? new Date(dateRange.end) : null
    const source = Array.isArray(series) ? series : []

    const byDate = new Map(source.map((item) => {
      const raw = item.date || item.period || item.period_start || item.period_end || item.label || ''
      const parsed = safeParseDate(raw)
      const key = parsed ? format(parsed, 'yyyy-MM-dd') : String(raw)
      return [key, { ...item, date: parsed ? format(parsed, 'MMM d') : String(raw), dateKey: key }]
    }))

    if (!start || !end || !isValid(start) || !isValid(end)) {
      return source.map((item) => ({
        ...item,
        date: item.date || item.period || item.period_start || item.period_end || item.label || '',
        [valueKey]: Number(item[valueKey] || 0),
      }))
    }

    return eachDayOfInterval({ start, end }).map((day) => {
      const key = format(day, 'yyyy-MM-dd')
      const existing = byDate.get(key) || {}
      return {
        ...existing,
        date: format(day, 'MMM d'),
        dateKey: key,
        [valueKey]: Number(existing[valueKey] || 0),
      }
    })
  }

  // Custom tooltips to match dashboard styling (better contrast on hover)
  const RevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl border border-orange-100 bg-white/95 p-3 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur">
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="text-sm text-slate-600">
            Revenue: <span className="font-semibold text-orange-600">{formatPrice(payload[0].value)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  const OrdersTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl border border-orange-100 bg-white/95 p-3 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur">
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="text-sm text-slate-600">Orders: <span className="font-semibold text-slate-900">{payload[0].value}</span></p>
        </div>
      )
    }
    return null
  }

  // PeakHours tooltip uses the requested orange/red color for the count
  const PeakHoursTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl border border-orange-100 bg-white/95 p-3 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur">
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="text-sm text-slate-600">Orders: <span className="font-semibold text-orange-600">{payload[0].value}</span></p>
        </div>
      )
    }
    return null
  }

  // Custom tooltip for Order Type Distribution — color values by type
  const OrderTypeTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const entry = payload[0]
      const name = (entry.name || entry.payload?.name || label || '').toString()
      const value = entry.value ?? entry.payload?.value ?? 0
      const norm = name.replace(/[_-]/g, ' ').toLowerCase()
      let valueClass = 'text-slate-900'
      if (norm.includes('dine')) valueClass = 'text-blue-600'
      else if (norm.includes('take') || norm.includes('takeaway')) valueClass = 'text-green-600'

      return (
        <div className="rounded-2xl border border-orange-100 bg-white/95 p-3 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur">
          <p className="text-sm font-semibold text-slate-900">{name}</p>
          <p className="text-sm text-slate-600">Count: <span className={`font-semibold ${valueClass.replace('text-gray','text-slate')}`}>{value}</span></p>
        </div>
      )
    }
    return null
  }

    // Format currency ticks with k/M suffix based on magnitude
    const formatCurrencyTick = (value) => {
      if (value === null || value === undefined || Number.isNaN(Number(value))) return ''
      const v = Number(value)
      const abs = Math.abs(v)
      if (abs >= 1000000) {
        const m = v / 1000000
        return `ETB ${Number.isInteger(m) ? m.toLocaleString() + 'M' : m.toFixed(1) + 'M'}`
      }
      if (abs >= 1000) {
        const k = v / 1000
        return `ETB ${Number.isInteger(k) ? k.toLocaleString() + 'k' : k.toFixed(1) + 'k'}`
      }
      return `ETB ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

  const chartRevenueData = normalizeSeries(
    (data?.revenueData || []).map((d) => ({
      ...d,
      revenue: Number(d.revenue || d.total_revenue || d.amount || 0),
    })),
    'revenue'
  )

  const chartOrdersData = normalizeSeries(
    (data?.ordersData || []).map((d) => ({
      ...d,
      orders: Number(d.orders || d.total_orders || d.count || 0),
    })),
    'orders'
  )

  // Compute ticks for revenue and orders charts: every even day + last day of month
  const computeTicks = (series) => {
    const keys = (Array.isArray(series) ? series : []).map(s => s.dateKey || s.date)
    let ticks = keys.filter((value) => {
      try {
        const parsed = safeParseDate(value)
        if (!parsed) return true
        const day = parsed.getDate()
        const lastDayOfMonth = new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0).getDate()
        return day % 2 === 0 || day === lastDayOfMonth
      } catch (e) {
        return true
      }
    })
    if (keys.length > 0) {
      const last = keys[keys.length - 1]
      if (!ticks.includes(last)) ticks.push(last)
    }
    // dedupe and sort ticks
    ticks = Array.from(new Set(ticks)).sort((a, b) => new Date(a) - new Date(b))
    return ticks
  }

  const revenueTicks = computeTicks(chartRevenueData)
  const ordersTicks = computeTicks(chartOrdersData)

  // Normalize peak hours data and provide fallback so Peak Hours chart renders
  let chartPeakHoursData = (data?.peakHours || data?.hourlyData || []).map(h => ({
    hour: typeof h.hour === 'number' ? String(h.hour).padStart(2, '0') + ':00' : (h.hour || h.label || h.time || ''),
    orders: Number(h.orders || h.avg_orders || h.count || h.total || 0),
  }))

  if (!chartPeakHoursData || chartPeakHoursData.length === 0) {
    // Fallback to a full-day zeroed series (00:00..23:00)
    chartPeakHoursData = Array.from({ length: 24 }).map((_, i) => ({ hour: String(i).padStart(2, '0') + ':00', orders: 0 }))
  }

  // Compute peak (max) orders for highlighting
  const maxOrders = Math.max(...chartPeakHoursData.map(d => Number(d.orders || 0)), 0)

  // Custom bar shape to add rounded corners and drop shadow
  const CustomBar = (props) => {
    const { x, y, width, height, fill } = props
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} rx={8} ry={8} fill={fill} filter="url(#barShadow)" />
      </g>
    )
  }

  const metrics = [
    {
      title: 'Total Revenue',
      value: formatPrice(data?.totalRevenue || 0),
      change: data?.revenueChange || 0,
      color: 'green',
    },
    {
      title: 'Total Orders',
      value: data?.totalOrders?.toLocaleString() || 0,
      change: data?.ordersChange || 0,
      color: 'blue',
    },
    {
      title: 'Avg Order Value',
      value: formatPrice(data?.avgOrderValue || 0),
      change: data?.avgOrderChange || 0,
      color: 'purple',
    },
    {
      title: 'Customer Satisfaction',
      value: data?.avgRating ? `${data.avgRating}/5` : 'No ratings',
      change: data?.ratingChange || 0,
      color: 'yellow',
    },
  ]

  const borderColors = {
    blue: 'border-l-blue-500',
    green: 'border-l-orange-500',
    purple: 'border-l-orange-500',
    yellow: 'border-l-yellow-500',
    red: 'border-l-orange-500',
    orange: 'border-l-orange-500',
  }

  return (           
    <div className="relative overflow-hidden space-y-6 bg-white p-4 sm:p-6 lg:p-8 font-['Manrope',system-ui,sans-serif] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),transparent_32%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-6">
      {/* Removed fallback notice per request */}
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Analytics Dashboard</h1>
          <p className="text-sm text-slate-500">Track your restaurant performance</p>
        </div>
        <div className="relative z-50 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <DateRangePicker value={dateRange} onChange={setDateRange} className="w-full sm:w-auto" />
          <ExportReport data={data} dateRange={dateRange} className="w-full rounded-none sm:w-auto" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative flex min-h-[96px] items-center justify-between overflow-hidden rounded-2xl border border-orange-100 border-l-4 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-5 ${borderColors[metric.color] || 'border-l-orange-500'}`}
          >
            <div>
              <p className="text-sm text-slate-500">{metric.title}</p>
              <p className="text-xl font-black text-slate-900 mt-1">{metric.value}</p>
            </div>
            {metric.icon && (
              <div className="p-3 rounded-full bg-white/0" style={{ backgroundColor: 'transparent' }}>
                <metric.icon className={`w-5 h-5 text-slate-700`} />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
        <div className="rounded-3xl border border-orange-100 bg-white/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartRevenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="dateKey" stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} tickLine={false} ticks={revenueTicks} tickFormatter={(v) => { try { const p = safeParseDate(v); return p ? format(p, 'MMM d') : String(v) } catch(e) { return String(v) } }} />
                <YAxis stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} tickFormatter={formatCurrencyTick} />
                <Tooltip content={<RevenueTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border border-orange-100 bg-white/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Orders Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartOrdersData} barSize={18} barGap={10}>
              <defs>
                <linearGradient id="ordersBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="dateKey" stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} tickLine={false} ticks={ordersTicks} tickFormatter={(v) => { try { const p = safeParseDate(v); return p ? format(p, 'MMM d') : String(v) } catch(e) { return String(v) } }} />
              <YAxis stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} />
              <Tooltip content={<OrdersTooltip />} />
              <Bar dataKey="orders" fill="url(#ordersBarGradient)" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      {/* </div> */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-orange-100 bg-white/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Order Type Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                {(() => {
                  // Normalize possible shapes for order type distribution
                  const raw = data?.orderTypeDistribution || data?.revenueByType || []
                  let normalized = []
                  if (raw && raw.length > 0) {
                    normalized = raw.map((r, i) => ({ name: r.name || r.label || `Type ${i+1}`, value: Number(r.value || r.amount || r.percentage || r.count || 0) }))
                  }

                  if (!normalized || normalized.length === 0) {
                    // Fallback: try topCategories as a proxy
                    const fromTop = (data?.topCategories || []).slice(0, 3).map((c, i) => ({ name: c.name || `Category ${i+1}`, value: Number(c.orders || c.count || c.total || 0) }))
                    normalized = fromTop.length > 0 ? fromTop : [
                      { name: 'Dine-in', value: 0 },
                      { name: 'Takeaway', value: 0 },
                      { name: 'Delivery', value: 0 },
                    ]
                  }

                  return (
                    <>
                      <Pie
                        data={normalized}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {normalized.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<OrderTypeTooltip />} />
                    </>
                  )
                })()}
              </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border border-orange-100 bg-white/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Peak Hours</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartPeakHoursData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="peakAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff7a18" stopOpacity={0.85} />
                  <stop offset="60%" stopColor="#df452a" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#ffb86b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="hour"
                stroke="#9ca3af"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                tickFormatter={(value) => {
                  const m = String(value).match(/^(\d{2}):/)
                  if (m) {
                    const h = Number(m[1])
                    if (h === 0) return '12 AM'
                    if (h < 12) return `${h} AM`
                    if (h === 12) return '12 PM'
                    return `${h - 12} PM`
                  }
                  return value
                }}
              />
              <YAxis stroke="#9ca3af" tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => value.toLocaleString()} />
              <Tooltip content={<PeakHoursTooltip />} />
              <Area type="monotone" dataKey="orders" stroke="#df452a" strokeWidth={2} fill="url(#peakAreaGradient)">
                <LabelList dataKey="orders" position="top" formatter={(val) => val.toLocaleString()} style={{ fill: '#374151', fontSize: 12, fontWeight: 600 }} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Categories & Payment Methods */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-orange-100 bg-white/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Top Categories</h3>
          <div className="space-y-3">
            {data?.topCategories?.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm text-slate-700">{category.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-900">{category.orders} orders</span>
                  <span className="text-sm text-slate-500">{category.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-orange-100 bg-white/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Payment Methods</h3>
          <div className="space-y-3">
            {data?.paymentMethods?.map((method, index) => (
              <div key={method.name} className="flex items-center justify-between">
                <span className="text-sm text-slate-700 capitalize">{method.name}</span>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full`}
                      style={{ width: `${method.percentage}%`, backgroundColor: COLORS[index % COLORS.length] }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-900">{method.percentage}%</span>
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

export default RestaurantAnalytics
