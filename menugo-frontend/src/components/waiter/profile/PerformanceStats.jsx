import React from 'react'
import { motion } from 'framer-motion'
import { Star, ShoppingBag, DollarSign, BarChart } from 'lucide-react'

const PerformanceStats = ({ stats }) => {
  const items = [
    {
      label: 'Total Orders Served',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'blue'
    },
    {
      label: 'Total Revenue Generated',
      value: `$${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'Average Rating',
      value: `${stats?.avgRating || 0}/5`,
      icon: Star,
      color: 'yellow'
    },
    {
      label: 'Total Tips Earned',
      value: `$${stats?.totalTips?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'purple'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-5 border border-gray-200"
          >
            <div className={`p-2 rounded-lg bg-${item.color}-100 inline-block mb-3`}>
              <item.icon className={`w-5 h-5 text-${item.color}-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="text-sm text-gray-500 mt-1">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Monthly Performance Chart */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
        <div className="space-y-4">
          {stats?.monthlyData?.map((month, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{month.month}</span>
                <span className="text-gray-900 font-medium">{month.orders} orders</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(month.orders / (stats?.maxOrders || 1)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PerformanceStats