import React from 'react'
import { Bell, CheckCircle, Clock } from 'lucide-react'

const KitchenNotificationItem = ({ notification }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'order_ready':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'new_order':
        return <Bell className="w-5 h-5 text-blue-500" />
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />
    }
  }

  return (
    <div className="bg-white rounded-xl p-3 border border-gray-200 hover:shadow transition-shadow">
      <div className="flex gap-3 items-start">
        <div className="flex-shrink-0">{getIcon(notification.type)}</div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{notification.title}</p>
          <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
          {notification.time && <p className="text-xs text-gray-400 mt-2">{notification.time}</p>}
        </div>
        {!notification.isRead && (
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
        )}
      </div>
    </div>
  )
}

export default KitchenNotificationItem
