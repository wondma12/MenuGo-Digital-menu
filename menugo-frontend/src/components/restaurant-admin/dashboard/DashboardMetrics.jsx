import React from 'react'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

const DashboardMetrics = ({ title, value, change, icon: Icon, color }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
  }

  const borderColors = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    purple: 'border-l-purple-500',
    yellow: 'border-l-yellow-500',
    red: 'border-l-red-500',
    orange: 'border-l-orange-500',
  }

  const borderClass = borderColors[color] || 'border-l-blue-500'

  // Resolve color classes with fallbacks to avoid runtime errors when `color` is undefined
  const bgClass = colors[color] || 'bg-blue-500'
  const textColorClass = bgClass.replace('bg-', 'text-') || 'text-blue-500'

  return (
    <div className={`group relative flex h-24 items-center justify-between overflow-hidden rounded-2xl border border-orange-100 border-l-4 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-xl ${borderClass}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.08),transparent_40%)] opacity-0 transition-opacity group-hover:opacity-100" />
      <div>
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <p className="mt-1 text-xl font-black tracking-tight text-slate-900">{value}</p>
        {typeof change !== 'undefined' && Number.isFinite(Number(change)) && Number(change) !== 0 && (
          <div className="flex items-center gap-1 mt-1">
            {change > 0 ? (
              <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />
            ) : (
              <ArrowTrendingDownIcon className="w-3 h-3 text-red-500" />
            )}
            <span className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(change)}% from yesterday
            </span>
          </div>
        )}
      </div>
      {Icon && (
        <div className={`rounded-full p-3 ${bgClass} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${textColorClass}`} />
        </div>
      )}
    </div>
  )
}

export default DashboardMetrics
