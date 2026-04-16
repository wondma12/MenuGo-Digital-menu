import React from 'react'
import { motion } from 'framer-motion'
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

  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all border-l-4 ${borderClass}`}> 
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
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
        <div className={`p-3 rounded-full ${colors[color]} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${colors[color].replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  )
}

export default DashboardMetrics