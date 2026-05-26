import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

const PerformanceChart = ({ data }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4 md:p-5">
      <div className="mb-3.5 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 sm:text-lg">Performance Overview</h3>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Orders served and customer rating over time.</p>
        </div>
        <div className="inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">Live trend</div>
      </div>
      <div className="h-56 sm:h-64 lg:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} minTickGap={18} />
            <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} width={28} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} width={28} />
            <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={3} dot={false} activeDot={{ r: 5 }} name="Orders Served" />
            <Line yAxisId="right" type="monotone" dataKey="rating" stroke="#059669" strokeWidth={3} dot={false} activeDot={{ r: 5 }} name="Rating" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default PerformanceChart