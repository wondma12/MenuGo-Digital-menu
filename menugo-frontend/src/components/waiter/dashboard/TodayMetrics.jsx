import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

const TodayMetrics = ({ metrics }) => {
  const items = [
      {
      label: 'Completed Orders',
      value: metrics?.completedOrders || 0,
      icon: CheckCircle,
      color: 'green'
    },
    {
      label: 'Pending Verification',
      value: metrics?.pendingVerification || 0,
      icon: Clock,
      color: 'yellow'
    },
    {
      label: 'Rejected Orders',
      value: metrics?.rejectedOrders || 0,
      icon: XCircle,
      color: 'red'
    }
  ]

  return (
    <div className="bg-white rounded p-5 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <item.icon className={`w-5 h-5 text-${item.color}-500`} />
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
            <span className="text-xl font-bold text-gray-900">{item.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default TodayMetrics