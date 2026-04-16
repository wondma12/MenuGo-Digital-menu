import React from 'react'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline'

const MetricCard = ({ title, value, change, icon: Icon, color }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{title}</p>
    </div>
  )
}

const PlatformMetrics = ({ data }) => {
  const metrics = [
    { title: 'Avg Order Value', value: `$${data.avgOrderValue || 0}`, change: data.avgOrderValueChange, icon: ChartBarIcon, color: 'text-blue-600' },
    { title: 'Active Users', value: data.activeUsers?.toLocaleString() || 0, change: data.activeUsersChange, icon: UserGroupIcon, color: 'text-green-600' },
    { title: 'Conversion Rate', value: `${data.conversionRate || 0}%`, change: data.conversionRateChange, icon: ChartBarIcon, color: 'text-purple-600' },
    { title: 'Retention Rate', value: `${data.retentionRate || 0}%`, change: data.retentionRateChange, icon: UserGroupIcon, color: 'text-orange-600' },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Metrics</h3>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MetricCard {...metric} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default PlatformMetrics