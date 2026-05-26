import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { format, differenceInCalendarDays, isValid, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import DateRangePicker from './DateRangePicker'
import ExportReport from './ExportReport'
import Loading from '../../../common/Loading'
import { getPlatformDashboardData } from '../../../services/analyticsService'
import { formatPrice } from '../../../utils/currency'

const shortNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '0'
  const v = Number(value)
  const abs = Math.abs(v)
  if (abs >= 1000000) {
    const m = v / 1000000
    return Number.isInteger(m) ? `${m}M` : `${m.toFixed(1)}M`
  }
  if (abs >= 1000) {
    const k = v / 1000
    return Number.isInteger(k) ? `${k}k` : `${k.toFixed(1)}k`
  }
  return v.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

const COLORS = ['#3b82f6', '#f97316', '#10b981', '#eab308', '#ef4444']

const getChartDateFormat = (dateRange) => {
  const start = dateRange?.start ? new Date(dateRange.start) : null
  const end = dateRange?.end ? new Date(dateRange.end) : null
  if (!start || !end || !isValid(start) || !isValid(end)) return 'MMM yyyy'

  const spanDays = Math.max(0, differenceInCalendarDays(end, start)) + 1
  if (spanDays <= 31) return 'MMM d'
  if (spanDays <= 92) return 'MMM d'
  return 'MMM yyyy'
}

const formatChartLabel = (value, dateRange) => {
  if (!value) return ''

  const parsed = typeof value === 'string' ? (isValid(parseISO(value)) ? parseISO(value) : new Date(value)) : new Date(value)
  if (isValid(parsed)) {
    return format(parsed, getChartDateFormat(dateRange))
  }

  return String(value)
}

// Decide which tick labels to show: even days and the last day of the month
const shouldShowTickLabel = (value) => {
  if (!value) return true
  try {
    const parsed = typeof value === 'string' && value.length === 10 && /\d{4}-\d{2}-\d{2}/.test(value)
      ? parseISO(value)
      : (isValid(parseISO(value)) ? parseISO(value) : new Date(value))
    if (!isValid(parsed)) return true
    const day = parsed.getDate()
    const lastDay = new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0).getDate()
    return day % 2 === 0 || day === lastDay
  } catch (e) {
    return true
  }
}

const normalizeChartSeries = (series, dateRange, fillDaily = false) => {
  const source = Array.isArray(series) ? series : []
  const start = dateRange?.start ? new Date(dateRange.start) : null
  const end = dateRange?.end ? new Date(dateRange.end) : null
  const isDailyRange = fillDaily && start && end && isValid(start) && isValid(end) && differenceInCalendarDays(end, start) < 32

  const buildPoint = (item = {}, fallbackDate = null) => {
    const rawDate = item.date || item.label || item.period || item.month || item.day || item.time || fallbackDate || ''
    const parsed = typeof rawDate === 'string' ? (isValid(parseISO(rawDate)) ? parseISO(rawDate) : new Date(rawDate)) : new Date(rawDate)
    const dateKey = isValid(parsed) ? format(parsed, 'yyyy-MM-dd') : String(rawDate)

    return {
      ...item,
      dateKey,
      label: isValid(parsed) ? format(parsed, getChartDateFormat(dateRange)) : String(rawDate),
      revenue: Number(item.revenue || item.total_revenue || item.amount || item.value || 0),
      orders: Number(item.orders || item.total_orders || 0),
      new: Number(item.new || item.new_restaurants || item.newRestaurants || 0),
      total: Number(item.total || item.total_restaurants || item.totalRestaurants || 0),
      count: Number(item.count || 0),
    }
  }

  const normalized = source.map(item => buildPoint(item))

  if (!isDailyRange || !start || !end || !isValid(start) || !isValid(end)) {
    return normalized
  }

  const mapByDate = new Map(normalized.map(item => [item.dateKey, item]))
  return eachDayOfInterval({ start, end }).map((day) => {
    const dayKey = format(day, 'yyyy-MM-dd')
    const existing = mapByDate.get(dayKey) || {}
    return {
      ...existing,
      dateKey: dayKey,
      label: format(day, 'MMM d'),
      revenue: Number(existing.revenue || 0),
      orders: Number(existing.orders || 0),
      new: Number(existing.new || 0),
      total: Number(existing.total || 0),
      count: Number(existing.count || 0),
    }
  })
}

const ChartTooltip = ({ active, payload, label, renderValues }) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="rounded-2xl border border-orange-100 bg-white/95 p-3 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur">
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      {renderValues(payload)}
    </div>
  )
}

const ChartSection = ({ title, description, children, className = '' }) => (
  <div className={`rounded-3xl border border-orange-100 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] ${className}`}>
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    {children}
  </div>
)

const SectionFallback = ({ children }) => (
  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-6 text-sm text-slate-500">
    {children}
  </div>
)

const PlatformAnalytics = () => {
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  })

  const { data, isLoading } = useQuery(
    ['platformAnalytics', dateRange],
    // Use the richer dashboard API which aggregates restaurants, users, orders and revenue
    () => getPlatformDashboardData(dateRange)
  )

  const revenueSeries = normalizeChartSeries(data?.revenueData || [], dateRange, true)
  const growthSeries = normalizeChartSeries(data?.growthData || data?.restaurantGrowth || [], dateRange)
  const subscriptionSeries = normalizeChartSeries(data?.subscriptionDistribution || data?.subscriptionBreakdown || [], dateRange)

  return (          
    <div className="relative overflow-hidden space-y-6 bg-white p-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),transparent_32%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-6">
        {/* <div className="relative z-30 rounded-3xl border border-orange-100 bg-white/95 p-6 pb-12 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 sm:pb-14"> */}
          {/* <div className="relative z-40 space-y-3"> */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-2">
                {/* <span className="inline-flex rounded-full bg-gradient-to-r from-orange-100 to-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                  Platform Analytics
                </span> */}
                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Platform analytics</h1>
              </div>

              <div className="relative z-50 flex flex-nowrap items-center gap-2 overflow-x-auto lg:justify-end">
                <DateRangePicker value={dateRange} onChange={setDateRange} />
                <ExportReport data={data} dateRange={dateRange} type="platform" />
              </div>
            </div>

            <p className="max-w-2xl text-sm text-slate-500 sm:text-base">
              Monitor revenue, restaurants, users, and order trends from one polished dashboard.
            </p>
          {/* </div> */}
        {/* </div> */}

        <div className="relative z-10 -mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4 sm:-mt-6">
          <MetricCard title="Total Revenue" value={formatPrice(data?.totalRevenue || 0)} change={data?.revenueGrowth} />
          <MetricCard title="Active Restaurants" value={data?.activeRestaurants || 0} change={data?.restaurantsGrowth} />
          <MetricCard title="Active Users" value={(data?.activeUsers || 0).toLocaleString()} change={data?.usersGrowth} />
          <MetricCard title="Total Orders" value={(data?.totalOrders || 0).toLocaleString()} change={data?.ordersGrowth} />
        </div>

        {/* <div className="grid gap-6 xl:grid-cols-2"> */}
          <ChartSection title="Revenue Overview" description="Daily revenue and order mix across the selected range.">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#bfdbfe" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} tickLine={false} />
                <YAxis stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} tickFormatter={shortNumber} />
                <Tooltip
                  content={<ChartTooltip renderValues={(payload) => (
                    <p className="text-sm text-slate-600">
                      Revenue: <span className="font-semibold text-slate-900">{formatPrice(payload.find((p) => p.dataKey === 'revenue')?.value ?? 0)}</span>
                    </p>
                  )} />}
                />
                <Legend wrapperStyle={{ color: '#475569' }} />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="url(#revenueGradient)" strokeWidth={2} />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartSection>

          <ChartSection title="Orders Trend" description="Order volume mapped against the same time window.">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={revenueSeries} barSize={20} barGap={10}>
                <defs>
                  <linearGradient id="ordersBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="dateKey"
                  stroke="#475569"
                  tick={{ fill: '#475569', fontSize: 12 }}
                  tickLine={false}
                  interval={0}
                  tickFormatter={(value) => {
                    try {
                      return shouldShowTickLabel(value) ? formatChartLabel(value, dateRange) : ''
                    } catch (e) {
                      return ''
                    }
                  }}
                />
                <YAxis stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip
                  content={<ChartTooltip renderValues={(payload) => (
                    <p className="text-sm text-slate-600">
                      Orders: <span className="font-semibold text-slate-900">{Number(payload?.find((p) => p.dataKey === 'orders')?.value ?? 0).toLocaleString()}</span>
                    </p>
                  )} />}
                />
                <Bar dataKey="orders" fill="url(#ordersBarGradient)" radius={[10, 10, 0, 0]}>
                  <LabelList dataKey="orders" position="top" formatter={(v) => Number(v).toLocaleString()} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartSection>
        {/* </div> */}

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartSection title="Restaurant Growth" description="New restaurants compared with the cumulative total.">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={growthSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} tickLine={false} />
                <YAxis stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip
                  content={<ChartTooltip renderValues={(payload) => (
                    <>
                      <p className="text-sm text-slate-600">
                        New: <span className="font-semibold text-slate-900">{Number(payload.find((p) => p.dataKey === 'new')?.value ?? 0).toLocaleString()}</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Total: <span className="font-semibold text-slate-900">{Number(payload.find((p) => p.dataKey === 'total')?.value ?? 0).toLocaleString()}</span>
                      </p>
                    </>
                  )} />}
                />
                <Legend wrapperStyle={{ color: '#475569' }} />
                <Bar dataKey="new" fill="#f97316" radius={[8, 8, 0, 0]} />
                <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartSection>

          <ChartSection title="User Distribution" description="Breakdown of users across the platform.">
            <div className="h-[300px]">
              {(!data?.userDistribution || data.userDistribution.length === 0) ? (
                <SectionFallback>No user distribution data available yet.</SectionFallback>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.userDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(data?.userDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<ChartTooltip renderValues={(payload) => (
                        <p className="text-sm text-slate-600">
                          Count: <span className="font-semibold text-slate-900">{Number(payload?.[0]?.value ?? 0).toLocaleString()}</span>
                        </p>
                      )} />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartSection>
        </div>

        <ChartSection title="Subscription Distribution" description="Subscription tier mix for platform customers.">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subscriptionSeries} layout="vertical">
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} />
              <YAxis dataKey="tier" type="category" stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} width={96} />
              <Tooltip
                content={<ChartTooltip renderValues={(payload) => (
                  <p className="text-sm text-slate-600">
                    Count: <span className="font-semibold text-slate-900">{Number(payload?.[0]?.value ?? 0).toLocaleString()}</span>
                  </p>
                )} />}
              />
              <Bar dataKey="count" fill="#f97316" radius={[0, 12, 12, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      </div>
    </div>
  )
}

const MetricCard = ({ title, value, change }) => {
  const key = (title || '').toLowerCase()
  let accentClass = 'from-blue-500 to-cyan-400'
  if (key.includes('revenue')) accentClass = 'from-orange-500 to-amber-400'
  else if (key.includes('active users')) accentClass = 'from-emerald-500 to-teal-400'
  else if (key.includes('active restaurants')) accentClass = 'from-blue-500 to-cyan-400'
  else if (key.includes('users')) accentClass = 'from-emerald-500 to-teal-400'
  else if (key.includes('orders')) accentClass = 'from-orange-500 to-blue-500'

  return (
    <div className={`relative overflow-hidden rounded-none border border-orange-100 border-l-4 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] ${accentClass.includes('orange') ? 'border-l-orange-500' : accentClass.includes('emerald') ? 'border-l-emerald-500' : 'border-l-blue-500'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{value}</p>
        </div>
        {change !== undefined && (
          <div className={`rounded-none px-2.5 py-1 text-xs font-semibold ${change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  )
}

export default PlatformAnalytics