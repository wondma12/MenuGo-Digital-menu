import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, DollarSign, Star, Users } from 'lucide-react'

const WaiterStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Active Orders',
      value: stats?.activeOrders || 0,
      icon: ShoppingBag,
      color: 'blue',
      change: stats?.ordersChange
    },
    {
      title: 'Today\'s Revenue',
      value: `$${stats?.todayRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'green',
      change: stats?.revenueChange
    },
    {
      title: 'Today\'s Tips',
      value: `$${stats?.todayTips?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'yellow',
      change: stats?.tipsChange
    },
    {
      title: 'Customer Rating',
      value: `${stats?.rating || 0}/5`,
      icon: Star,
      color: 'purple',
      change: stats?.ratingChange
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {statCards.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
          className="bg-white rounded p-3 border border-gray-200/25 shadow transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-1 rounded bg-${stat.color}-100`}>
              <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
            </div>
            {stat.change !== undefined && (
              <span className={`text-xs font-medium ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change >= 0 ? '+' : ''}{stat.change}%
              </span>
            )}
          </div>
          <p className="text-xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-xs text-gray-500 mt-1">{stat.title}</p>
        </motion.div>
      ))}
    </div>
  )
}

export default WaiterStats