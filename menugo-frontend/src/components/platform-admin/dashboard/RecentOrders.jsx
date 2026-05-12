import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBagIcon, ClockIcon, CurrencyDollarIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'
import Button from '../../../common/Button'

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'danger',
    preparing: 'info',
    ready: 'purple',
  }
  return colors[status] || 'default'
}

const RecentOrders = ({ orders }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <p className="text-sm text-gray-500">Latest customer orders</p>
          </div>
          <Link to="/platform/analytics">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <ShoppingBagIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">Order #{index + 1}</span>
                    <Badge variant={getStatusColor(order.status)} size="sm">
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <BuildingOfficeIcon className="w-3 h-3" />
                      {order.restaurantName}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <CurrencyDollarIcon className="w-3 h-3" />
                      ${order.totalAmount}
                    </span>
                  </div>
                </div>
              </div>
              <Link to={`/platform/analytics?order=${order.id}`}>
                <span className="text-xs text-primary-600 hover:underline">View</span>
              </Link>
            </div>
          </motion.div>
        ))}
        {orders.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No recent orders found
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentOrders