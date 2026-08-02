import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import { format } from 'date-fns'
import { safeParseDate } from '../../../utils/dateUtils'

const shouldShowTickLabel = (value) => {
  const parsed = safeParseDate(value)
  if (!parsed) return true
  const day = parsed.getDate()
  const lastDayOfMonth = new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0).getDate()
  return day % 2 === 0 || day === lastDayOfMonth
}

const formatChartLabel = (value) => {
  try {
    const parsed = safeParseDate(value)
    if (!parsed) return String(value || '')
    return format(parsed, 'MMM d')
  } catch (e) {
    return String(value || '')
  }
}

const normalize = (data) => (Array.isArray(data) ? data : []).map(d => ({
  dateKey: (() => {
    const raw = d.date || d.period || d.period_start || d.label || d.name || ''
    const parsed = safeParseDate(raw)
    if (parsed) return format(parsed, 'yyyy-MM-dd')
    return String(raw)
  })(),
  label: (() => {
    const raw = d.date || d.period || d.period_start || d.label || d.name || ''
    const parsed = safeParseDate(raw)
    if (parsed) return format(parsed, 'MMM d')
    return String(raw)
  })(),
  orders: Number(d.orders ?? d.total_orders ?? d.count ?? d.order_count ?? 0),
}))

const OrdersChart = ({ data }) => {
  const series = normalize(data)
  // Compute tick positions: every even day and always include last day of month
  const allKeys = series.map(s => s.dateKey)
  let ticks = allKeys.filter((key) => shouldShowTickLabel(key))
  // Ensure the last day is included
  if (allKeys.length > 0) {
    const last = allKeys[allKeys.length - 1]
    if (!ticks.includes(last)) ticks.push(last)
  }
  // Dedupe and sort ticks chronologically
  ticks = Array.from(new Set(ticks)).sort((a, b) => new Date(a) - new Date(b))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const orders = payload.find(p => p.dataKey === 'orders')?.value ?? payload[0]?.value ?? 0
      const displayLabel = label || payload[0]?.payload?.label || ''
      return (
        <div className="rounded-2xl border border-orange-100 bg-white p-3 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <p className="text-sm font-semibold text-slate-900">{displayLabel}</p>
          <p className="text-sm text-slate-600">Orders: <span className="font-semibold text-slate-900">{Number(orders).toLocaleString()}</span></p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-3xl border border-orange-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Orders Trend</h3>
          <p className="text-sm text-slate-500">Order volume mapped against the same time window.</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={series} barSize={20} barGap={10}>
          <defs>
            <linearGradient id="ordersBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0.85} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="dateKey"
            stroke="#475569"
            tick={{ fill: '#475569', fontSize: 12 }}
            tickLine={false}
            ticks={ticks}
            tickFormatter={(value) => formatChartLabel(value)}
          />
            <YAxis stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} tickFormatter={(v) => (Number(v) || 0).toLocaleString()} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="orders" fill="url(#ordersBarGradient)" radius={[10, 10, 0, 0]}>
            <LabelList dataKey="orders" position="top" formatter={(v) => (Number(v) > 0 ? Number(v).toLocaleString() : '')} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default OrdersChart