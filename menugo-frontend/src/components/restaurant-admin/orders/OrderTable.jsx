import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { EyeIcon } from '@heroicons/react/24/outline'
import OrderStatusBadge from './OrderStatusBadge'
import OrderDetailsModal from './OrderDetailsModal'
import { formatCurrency } from '../../../utils/formatters'

const OrderTable = ({ orders, onRefresh }) => {
  const [selectedOrder, setSelectedOrder] = useState(null)

  const formatDate = (date) => {
    return new Date(date).toLocaleString()
  }

  return (
    <>
      <div className="overflow-hidden rounded-none bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Table</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-orange-50"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {order.customerName || 'Guest'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    Table {order.tableNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {order.itemCount} items
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOrder({ ...order, displayNumber: index + 1 })}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {orders.length === 0 && (
        <div className="rounded-none bg-white py-12 text-center shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <p className="text-slate-500">No orders found</p>
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

export default OrderTable