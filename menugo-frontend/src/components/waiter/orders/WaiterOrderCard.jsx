import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, User, MapPin, Eye } from 'lucide-react'
import OrderStatusBadge from './OrderStatusBadge'
import OrderPriorityBadge from './OrderPriorityBadge'
import OrderDetailsModal from '../order-details/OrderDetailsModal'

const WaiterOrderCard = ({ order, onRefresh }) => {
  const [showDetails, setShowDetails] = useState(false)

  const getTimeElapsed = (createdAt) => {
    const minutes = Math.floor((new Date() - new Date(createdAt)) / 60000)
    if (minutes < 60) return `${minutes} min ago`
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all"
        onClick={() => setShowDetails(true)}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Order #{order.orderNumber}</h3>
              <OrderPriorityBadge priority={order.priority} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <User className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{order.customerName || 'Guest'}</span>
              <MapPin className="w-3 h-3 text-gray-400 ml-1" />
              <span className="text-xs text-gray-500">Table {order.tableNumber}</span>
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Items:</span>
            <span className="font-medium text-gray-900">{order.itemCount} items</span>
          </div>
          <div className="text-xs text-gray-500 line-clamp-2">
            {order.items?.map(i => i.name).join(', ')}
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{getTimeElapsed(order.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary-600">${order.totalAmount}</span>
            <Eye className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </motion.div>

      {showDetails && (
        <OrderDetailsModal
          order={order}
          onClose={() => setShowDetails(false)}
          onRefresh={onRefresh}
        />
      )}
    </>
  )
}

export default WaiterOrderCard