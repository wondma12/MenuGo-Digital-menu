// src/components/platform-admin/dashboard/StatCard.jsx
import React from 'react'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-400',
    green: 'from-emerald-500 to-emerald-400',
    purple: 'from-violet-500 to-violet-400',
    orange: 'from-orange-500 to-amber-400',
    red: 'from-rose-500 to-rose-400',
    teal: 'from-cyan-500 to-blue-500',
    yellow: 'from-amber-500 to-orange-400',
  }

  const bgColors = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100',
    red: 'bg-red-100',
    teal: 'bg-teal-100',
    yellow: 'bg-yellow-100',
  }

  const textColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    teal: 'text-teal-600',
    yellow: 'text-yellow-600',
  }

  const borderColors = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    purple: 'border-l-purple-500',
    orange: 'border-l-orange-500',
    red: 'border-l-red-500',
    teal: 'border-l-teal-500',
    yellow: 'border-l-yellow-500',
  }

  const borderClass = borderColors[color] || 'border-l-blue-500'

  const isPositiveTrend = trend > 0

  return (
    <div className={`group relative flex h-28 items-center justify-between overflow-hidden rounded-2xl border border-slate-100 border-l-4 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl ${borderClass}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.08),transparent_40%)] opacity-0 transition-opacity group-hover:opacity-100" />
      <div>
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{value}</p>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {isPositiveTrend ? (
              <ArrowTrendingUpIcon className="w-3 h-3 text-emerald-500" />
            ) : (
              <ArrowTrendingDownIcon className="w-3 h-3 text-rose-500" />
            )}
          </div>
        )}
      </div>
      <div className={`rounded-xl bg-gradient-to-r ${colors[color]} p-2.5 text-white shadow-sm`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  )
}

export default StatCard