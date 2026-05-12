import React from 'react'
import { motion } from 'framer-motion'
import { ClockIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline'
import OrderStatusBadge from './OrderStatusBadge'
import Badge from '../../../common/Badge'

const OrderCard = ({ order, displayNumber, onClick, onRefresh }) => {
  const getTimeElapsed = (createdAt) => {
    const minutes = Math.floor((new Date() - new Date(createdAt)) / 60000)
    if (minutes < 60) return `${minutes} min ago`
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">Order #{displayNumber ?? order.orderNumber}</h3>
          <div className="flex items-center gap-2 mt-1">
            <UserIcon className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">{order.customerName || 'Guest'}</span>
            <MapPinIcon className="w-3 h-3 text-gray-400 ml-1" />
            <span className="text-xs text-gray-500">Table {order.tableNumber}</span>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">Items:</span>
          <span className="font-medium text-gray-900">{order.itemCount} items</span>
        </div>
        <div className="text-xs text-gray-500 line-clamp-2">
          {order.items?.map(i => i.name).join(', ')}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <ClockIcon className="w-3 h-3" />
          <span>{getTimeElapsed(order.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          {order.orderType && (
            <Badge variant="info" size="sm">{order.orderType}</Badge>
          )}
          <span className="font-bold text-primary-600">${order.totalAmount}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default OrderCard