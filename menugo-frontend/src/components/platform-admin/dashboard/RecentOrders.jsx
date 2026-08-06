
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
    <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Activity</p>
            <h3 className="mt-1 text-lg font-black text-slate-900">Recent Orders</h3>
            <p className="text-sm text-slate-500">Latest customer orders</p>
          </div>
          <Link to="/platform/analytics">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 transition-colors hover:bg-orange-50/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3 flex-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-100 to-orange-100">
                  <ShoppingBagIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900">Order #{index + 1}</span>
                    <Badge variant={getStatusColor(order.status)} size="sm">
                      {order.status}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
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
                <span className="text-xs font-semibold text-orange-600 hover:underline">View</span>
              </Link>
            </div>
          </motion.div>
        ))}
        {orders.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No recent orders found
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentOrders