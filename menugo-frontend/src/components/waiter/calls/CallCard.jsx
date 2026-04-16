import React from 'react'
import { motion } from 'framer-motion'

const CallCard = ({ call, onClick, onRefresh }) => {
  const getCallTypeIcon = (type) => {
    const icons = {
      service: '🛎️',
      bill: '💰',
      help: '❓',
      food_issue: '🍽️',
      other: '💬'
    }
    return icons[type] || '🔔'
  }

  const getCallTypeLabel = (type) => {
    const labels = {
      service: 'Service Request',
      bill: 'Bill Request',
      help: 'Help',
      food_issue: 'Food Issue',
      other: 'Other'
    }
    return labels[type] || 'Call'
  }

  const getTimeElapsed = (createdAt) => {
    const minutes = Math.floor((new Date() - new Date(createdAt)) / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} min ago`
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`
  }

  const isPending = call.status === 'pending'

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all ${
        isPending ? 'border-red-200 shadow-md' : 'border-gray-200'
      } hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
          isPending ? 'bg-red-100' : 'bg-gray-100'
        }`}>
          {getCallTypeIcon(call.callType)}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900">Table {call.tableNumber}</h3>
              <p className="text-sm text-gray-500">{getCallTypeLabel(call.callType)}</p>
            </div>
            <div className="text-right">
              {isPending && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mb-1" />
              )}
              <span className="text-xs text-gray-400">{getTimeElapsed(call.createdAt)}</span>
            </div>
          </div>
          {call.notes && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{call.notes}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {isPending ? (
              <span className="text-xs text-red-600 font-medium">Pending</span>
            ) : call.status === 'acknowledged' ? (
              <span className="text-xs text-blue-600 font-medium">Acknowledged</span>
            ) : (
              <span className="text-xs text-green-600 font-medium">Resolved</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CallCard