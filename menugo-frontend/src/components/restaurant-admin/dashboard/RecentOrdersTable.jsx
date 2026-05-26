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
      <div className="overflow-hidden rounded-none bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="p-5">
          <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
          <p className="text-sm text-slate-500">Latest customer orders</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white">
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
              {orders.map((order, idx) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">#{idx + 1}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{order.customerName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{order.tableNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{order.itemCount} items</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">${order.totalAmount}</td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusColor(order.status)} size="sm">
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOrder({ ...order, displayNumber: idx + 1 })}
                      className="text-orange-600 hover:text-orange-700"
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