
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const RestaurantGrowthChart = ({ data }) => {
  const normalized = (data || []).map((item) => ({
    label: item.month || item.period || item.label || (item.startDate ? new Date(item.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''),
    new: Number(item.new_restaurants ?? item.newRestaurants ?? item.new ?? item.value ?? 0) || 0,
    total: Number(item.total_restaurants ?? item.totalRestaurants ?? item.total ?? 0) || 0,
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null

    const newValue = payload.find((entry) => entry.dataKey === 'new')?.value ?? payload[0]?.value ?? 0
    const totalValue = payload.find((entry) => entry.dataKey === 'total')?.value ?? payload[1]?.value ?? 0

    return (
      <div className="rounded-2xl border border-orange-100 bg-white p-3 shadow-xl">
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="text-sm text-slate-600">
          New: <span className="font-semibold text-blue-600">{Number(newValue).toLocaleString()}</span>
        </p>
        <p className="text-sm text-slate-600">
          Total: <span className="font-semibold text-emerald-600">{Number(totalValue).toLocaleString()}</span>
        </p>
      </div>
    )
  }

  if (!normalized.length) {
    return (
      <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Growth</p>
          <h3 className="mb-4 mt-1 text-lg font-black text-slate-900">Restaurant Growth</h3>
          <p className="text-sm text-slate-500">New restaurants added per month</p>
        </div>
        <div className="py-10 text-center text-sm text-slate-500">No data available for this period.</div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Growth</p>
        <h3 className="mb-1 mt-1 text-lg font-black text-slate-900">Restaurant Growth</h3>
        <p className="text-sm text-slate-500">New restaurants added per month</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={normalized}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" stroke="#0f172a" tick={{ fill: '#0f172a', fontSize: 12 }} tickLine={false} />
          <YAxis stroke="#0f172a" tick={{ fill: '#0f172a', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="new" fill="#3b82f6" name="New Restaurants">
            {normalized.map((entry, index) => (
              <Cell key={`cell-new-${index}`} fill="#3b82f6" />
            ))}
          </Bar>
          <Bar dataKey="total" fill="#f97316" name="Total Restaurants">
            {normalized.map((entry, index) => (
              <Cell key={`cell-total-${index}`} fill="#f97316" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RestaurantGrowthChart