import React from 'react'
import { motion } from 'framer-motion'
import { ClockIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline'
import OrderStatusBadge from './OrderStatusBadge'
import Badge from '../../../common/Badge'
import { formatCurrency } from '../../../utils/formatters'

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
      className="cursor-pointer rounded-none bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)]"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-slate-900">Order #{displayNumber ?? order.orderNumber}</h3>
          <div className="flex items-center gap-2 mt-1">
            <UserIcon className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500">{order.customerName || 'Guest'}</span>
            <MapPinIcon className="w-3 h-3 text-slate-400 ml-1" />
            <span className="text-xs text-slate-500">Table {order.tableNumber}</span>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-500">Items:</span>
          <span className="font-medium text-slate-900">{order.itemCount} items</span>
        </div>
        <div className="text-xs text-slate-500 line-clamp-2">
          {order.items?.map(i => i.name).join(', ')}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-3">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <ClockIcon className="w-3 h-3" />
          <span>{getTimeElapsed(order.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          {order.orderType && (
            <Badge variant="info" size="sm">{order.orderType}</Badge>
          )}
          <span className="font-bold text-orange-600">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default OrderCard