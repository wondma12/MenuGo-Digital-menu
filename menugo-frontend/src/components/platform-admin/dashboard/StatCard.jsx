// src/components/platform-admin/dashboard/StatCard.jsx
import React from 'react'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    teal: 'bg-teal-500',
    yellow: 'bg-yellow-500',
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
    <div className={`bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all border-l-4 ${borderClass} h-full`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isPositiveTrend ? (
                <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />
              ) : (
                <ArrowTrendingDownIcon className="w-3 h-3 text-red-500" />
              )}
              <span className={`text-xs ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue || `${Math.abs(trend)}%`} from last period
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${bgColors[color]} ${textColors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

export default StatCard