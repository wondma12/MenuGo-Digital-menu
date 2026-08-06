
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format } from 'date-fns'
import { formatPrice, formatPriceShort } from '../../../utils/currency'
import { safeParseDate } from '../../../utils/dateUtils'

const shouldShowTickLabel = (value) => {
  const parsed = safeParseDate(value)
  if (!parsed) return true
  const day = parsed.getDate()
  const lastDayOfMonth = new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0).getDate()
  return day % 2 === 0 || day === lastDayOfMonth
}

const RevenueChart = ({ data }) => {
  // Normalize incoming data into { label, revenue, orders }
  const normalized = (Array.isArray(data) ? data : []).map(d => ({
    label: (() => {
      const raw = d.name || d.label || d.month || d.date || d.period || ''
      const parsed = safeParseDate(raw)
      if (parsed) return format(parsed, 'MMM d')
      return String(raw)
    })(),
    revenue: Number(d.revenue ?? d.total_revenue ?? d.amount ?? d.value ?? 0),
    orders: Number(d.orders ?? d.total_orders ?? d.order_count ?? d.count ?? 0),
    raw: d,
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Prefer finding entries by dataKey, fallback to payload content
      const revenueEntry = payload.find(p => p.dataKey === 'revenue' || p.name === 'Revenue') || payload[0]
      const revenueValue = revenueEntry?.value ?? revenueEntry?.payload?.revenue ?? revenueEntry?.payload?.total_revenue ?? revenueEntry?.payload?.value ?? null

      const displayLabel = label || revenueEntry?.payload?.label || revenueEntry?.payload?.date || ''

      return (
        <div className="rounded-2xl border border-orange-100 bg-white p-3 text-slate-900 shadow-xl">
          <p className="text-sm font-bold text-slate-900">{displayLabel}</p>
          <p className="text-sm text-slate-600">
            Revenue: <span className="font-semibold text-orange-600">{formatPrice(revenueValue)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Revenue</p>
          <h3 className="mt-1 text-lg font-black text-slate-900">Revenue Overview</h3>
          <p className="text-sm text-slate-500">Monthly revenue and order trends</p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">Revenue</span>
          <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">Orders</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={normalized}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.18}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.18}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" stroke="#0f172a" fontSize={12} tick={{ fill: '#0f172a' }} interval={0} minTickGap={0} tickFormatter={(value) => (shouldShowTickLabel(value) ? value : '')} />
          <YAxis yAxisId="left" stroke="#0f172a" fontSize={12} tick={{ fill: '#0f172a' }} tickFormatter={(value) => formatPriceShort(value)} />
          <YAxis yAxisId="right" orientation="right" stroke="#0f172a" fontSize={12} tick={{ fill: '#0f172a' }} tickFormatter={(value) => Number(value).toLocaleString()} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            name="Orders"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RevenueChart