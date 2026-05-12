import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, User, MapPin, Eye } from 'lucide-react'
import OrderStatusBadge from './OrderStatusBadge'
import OrderPriorityBadge from './OrderPriorityBadge'
import OrderDetailsModal from '../order-details/OrderDetailsModal'

const WaiterOrderCard = ({ order, displayNumber, onRefresh }) => {
  const [showDetails, setShowDetails] = useState(false)

  const getTimeElapsed = (createdAt) => {
    const minutes = Math.floor((new Date() - new Date(createdAt)) / 60000)
    if (minutes < 60) return `${minutes} min ago`
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`
  }

  const formatMoney = (n) => {
    const v = Number(n)
    if (isNaN(v)) return '0.00'
    return v.toFixed(2)
  }

  const computeItemsTotal = (items) => {
    if (!Array.isArray(items) || items.length === 0) return 0
    return items.reduce((s, it) => s + (Number(it.unitPrice ?? it.price ?? 0) * Number(it.quantity ?? it.qty ?? 1)), 0)
  }

  const displayTotal = (() => {
    if (!order) return '0.00'
    if (order.totalAmount != null) return formatMoney(order.totalAmount)
    if (order.total != null) return formatMoney(order.total)
    if (order.total_amount != null) return formatMoney(order.total_amount)
    const itemsTotal = computeItemsTotal(order.items)
    return formatMoney(itemsTotal)
  })()

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200/25 p-3 cursor-pointer hover:shadow transition-all"
        onClick={() => setShowDetails(true)}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-gray-900">Order #{displayNumber ?? order.orderNumber ?? order.order_number ?? order.number ?? order.id ?? ''}</h3>
              <OrderPriorityBadge priority={order.priority} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <User className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{order.customerName ?? order.customer?.name ?? 'Guest'}</span>
              <MapPin className="w-3 h-3 text-gray-400 ml-1" />
              <span className="text-xs text-gray-500">Table {order.tableNumber ?? order.table_number ?? order.table?.number ?? ''}</span>
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Items:</span>
            <span className="font-medium text-gray-900">{order.itemCount ?? order.items?.length ?? 0} items</span>
          </div>
          <div className="text-xs text-gray-500 line-clamp-2">
            {Array.isArray(order.items) ? order.items.map(i => i.name ?? i.title ?? '').filter(Boolean).join(', ') : ''}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{getTimeElapsed(order.createdAt)}</span>
          </div>
            <div className="flex items-center gap-2">
            <span className="font-bold text-primary-600">${displayTotal}</span>
            <Eye className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </motion.div>

      {showDetails && (
        <OrderDetailsModal
          order={order}
          displayNumber={displayNumber}
          onClose={() => setShowDetails(false)}
          onRefresh={onRefresh}
        />
      )}
    </>
  )
}

export default WaiterOrderCard