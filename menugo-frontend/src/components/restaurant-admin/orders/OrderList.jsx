import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import OrderCard from './OrderCard'
import OrderDetailsModal from './OrderDetailsModal'

const OrderList = ({ orders, onRefresh }) => {
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Group orders by status
  const groupedOrders = {
    pending: orders.filter(o => o.status === 'pending'),
    verified: orders.filter(o => o.status === 'verified'),
    preparing: orders.filter(o => o.status === 'preparing'),
    ready: orders.filter(o => o.status === 'ready'),
    served: orders.filter(o => o.status === 'served'),
    completed: orders.filter(o => o.status === 'completed'),
  }

  const statusTitles = {
    pending: '🆕 New Orders',
    verified: '✅ Verified Orders',
    preparing: '🔪 Preparing',
    ready: '🍽️ Ready to Serve',
    served: '✨ Served',
    completed: '✓ Completed',
  }

  return (
    <>
      <div className="space-y-8">
        {Object.entries(groupedOrders).map(([status, statusOrders]) => 
          statusOrders.length > 0 && (
            <div key={status}>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{statusTitles[status]}</h2>
                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {statusOrders.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {statusOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <OrderCard
                        order={order}
                        onClick={() => setSelectedOrder(order)}
                        onRefresh={onRefresh}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )
        )}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
          <p className="text-gray-500 mt-1">Orders will appear here once customers place them</p>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onRefresh={onRefresh}
        />
      )}
    </>
  )
}

export default OrderList