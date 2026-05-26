import React from 'react'
import { Bell, CheckCircle, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const WaiterNotificationItem = ({ notification, markAsRead }) => {
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

  const navigate = useNavigate()

  const handleClick = async () => {
    try {
      if (markAsRead) markAsRead(notification.id || notification.id)
    } catch (e) {
      // ignore
    }

    const actionUrl = notification.actionUrl || notification.action_url
    const type = notification.type || notification.notification_type
    const isRead = notification.isRead ?? notification.is_read
    const data = notification.data || notification.payload || null

    if (actionUrl) return navigate(actionUrl)

    switch (type) {
      case 'customer_call':
        return navigate(`/waiter/calls/${(data && data.callId) || notification.id}`)
      case 'order_ready':
      case 'new_order':
        return navigate((data && data.orderId) ? `/waiter/orders/${data.orderId}` : '/waiter/orders')
      default:
        return
    }
  }

  return (
    <div onClick={handleClick} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex gap-3">
        <div className="flex-shrink-0">{getIcon(notification.type)}</div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{notification.title}</p>
          <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
          <p className="text-xs text-gray-400 mt-2">{notification.time || new Date(notification.created_at || notification.createdAt).toLocaleString()}</p>
        </div>
        {!notification.isRead && (
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </div>
    </div>
  )
}

export default WaiterNotificationItem