import React, { useState } from 'react'
import { EyeIcon } from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'
import OrderDetailsModal from '../../restaurant-admin/orders/OrderDetailsModal'

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    verified: 'info',
    preparing: 'blue',
    ready: 'purple',
    served: 'success',
    completed: 'success',
    cancelled: 'danger',
  }
  return colors[status] || 'default'
}

const RecentOrdersTable = ({ orders }) => {
  const [selectedOrder, setSelectedOrder] = useState(null)

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <p className="text-sm text-gray-500">Latest customer orders</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order, idx) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{idx + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.customerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.tableNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.itemCount} items</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">${order.totalAmount}</td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusColor(order.status)} size="sm">
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOrder({ ...order, displayNumber: idx + 1 })}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  )
}

export default RecentOrdersTable