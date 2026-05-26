import React, { useState } from 'react'
import { useMutation } from 'react-query'
import Modal from '../../../common/Modal'
import Button from '../../../common/Button'
import OrderItemsList from './OrderItemsList'
import OrderStatusBadge from './OrderStatusBadge'
import { updateOrderStatus } from '../../../services/orderService'
import toast from 'react-hot-toast'
import { formatCurrency } from '../../../utils/formatters'

const OrderDetailsModal = ({ order, onClose, onRefresh }) => {
  const [isUpdating, setIsUpdating] = useState(false)

  const updateMutation = useMutation(updateOrderStatus, {
    onSuccess: () => {
      toast.success('Order status updated')
      onRefresh()
      onClose()
    },
    onError: () => {
      toast.error('Failed to update order status')
    },
  })

  const handleStatusUpdate = (newStatus) => {
    updateMutation.mutate({ id: order.id, status: newStatus })
  }

  const statusFlow = {
    pending: ['verify', 'reject'],
    verified: ['preparing'],
    preparing: ['ready'],
    ready: ['serve'],
    served: ['complete'],
  }

  const getNextActions = () => {
    const actions = {
      verify: { label: 'Verify Order', status: 'verified', color: 'primary' },
      reject: { label: 'Reject Order', status: 'rejected', color: 'danger' },
      preparing: { label: 'Start Preparing', status: 'preparing', color: 'warning' },
      ready: { label: 'Mark as Ready', status: 'ready', color: 'success' },
      serve: { label: 'Serve to Table', status: 'served', color: 'primary' },
      complete: { label: 'Complete Order', status: 'completed', color: 'success' },
    }
    return (statusFlow[order.status] || []).map(action => actions[action])
  }

  const titleNum = order.displayNumber ?? order.orderNumber;
  return (
    <Modal isOpen={true} onClose={onClose} title={`Order Details - #${titleNum}`} size="md">
      <div className="space-y-4">
        {/* Order Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Customer</p>
            <p className="font-medium text-slate-900">{order.customerName || 'Guest'}</p>
            <p className="mt-3 text-sm text-slate-500">Table Number</p>
            <p className="font-medium text-slate-900">{order.tableNumber}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-slate-500">Order Status</p>
            <div className="mt-1">
              <OrderStatusBadge status={order.status} size="md" />
            </div>
            <p className="mt-3 text-sm text-slate-500">Total Amount</p>
            <p className="text-2xl font-extrabold text-orange-600">{formatCurrency(order.totalAmount)}</p>
          </div>
        </div>

        {/* Order Timeline removed per request */}

        {/* Order Items */}
        <OrderItemsList items={order.items || []} order={order} />

        {/* Special Instructions */}
        {order.specialInstructions && (
          <div className="rounded-none bg-orange-50 p-3">
            <p className="text-sm font-medium text-orange-800">Special Instructions:</p>
            <p className="mt-1 text-sm text-orange-700">{order.specialInstructions}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          {getNextActions().map((action) => (
            <Button
              key={action.status}
              variant={action.color}
              onClick={() => handleStatusUpdate(action.status)}
              isLoading={updateMutation.isLoading}
            >
              {action.label}
            </Button>
          ))}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default OrderDetailsModal