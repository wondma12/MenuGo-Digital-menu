import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock } from 'lucide-react'

const RecentActivity = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  return (
    <div className="bg-white rounded p-5 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities?.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              {getActivityIcon(activity.type)}
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.description}</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">{activity.time}</span>
          </motion.div>
        ))}
        {(!activities || activities.length === 0) && (
          <p className="text-center text-gray-500 py-4">No recent activity</p>
        )}
      </div>
    </div>
  )
}

export default RecentActivity