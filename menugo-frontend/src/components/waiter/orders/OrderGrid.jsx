
import { motion } from 'framer-motion'
import { Clock, Check, Activity } from 'lucide-react'
import WaiterOrderCard from './WaiterOrderCard'

const OrderGrid = ({ orders, onRefresh }) => {
  // Group orders by status
  const groupedOrders = {
    pending: orders?.filter(o => o.status === 'pending') || [],
    verified: orders?.filter(o => o.status === 'verified') || [],
    preparing: orders?.filter(o => o.status === 'preparing') || [],
    ready: orders?.filter(o => o.status === 'ready') || [],
    completed: orders?.filter(o => o.status === 'completed') || []
  }

  const statusTitles = {
    pending: { label: 'New Orders', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-5 h-5" /> },
    verified: { label: 'Verified', color: 'bg-blue-100 text-blue-800', icon: <Check className="w-5 h-5" /> },
    preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-800', icon: <Activity className="w-5 h-5" /> },
    ready: { label: 'Ready to Serve', color: 'bg-purple-100 text-purple-800', icon: <Check className="w-5 h-5" /> },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: <Check className="w-5 h-5" /> }
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedOrders).map(([status, statusOrders]) => 
        statusOrders.length > 0 && (
          <div key={status}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{statusTitles[status]?.icon}</span>
              <h2 className="text-lg font-semibold text-gray-900">{statusTitles[status]?.label}</h2>
              <span className={`px-2 py-0.5 text-xs rounded-full ${statusTitles[status]?.color}`}>
                {statusOrders.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {statusOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <WaiterOrderCard order={order} onRefresh={onRefresh} />
                </motion.div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}

export default OrderGrid