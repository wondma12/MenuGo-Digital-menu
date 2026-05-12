import React, { useState } from 'react'
import { useMutation } from 'react-query'
import Modal from '../../../common/Modal'
import Button from '../../../common/Button'
import OrderItemsList from './OrderItemsList'
import OrderStatusBadge from './OrderStatusBadge'
import { updateOrderStatus } from '../../../services/orderService'
import toast from 'react-hot-toast'

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
    <Modal isOpen={true} onClose={onClose} title={`Order Details - #${titleNum}`} size="lg">
      <div className="space-y-6">
        {/* Order Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-medium text-gray-900">{order.customerName || 'Guest'}</p>
            <p className="text-sm text-gray-500 mt-2">Table Number</p>
            <p className="font-medium text-gray-900">{order.tableNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Order Status</p>
            <OrderStatusBadge status={order.status} size="md" />
            <p className="text-sm text-gray-500 mt-2">Total Amount</p>
            <p className="text-xl font-bold text-primary-600">${order.totalAmount}</p>
          </div>
        </div>

        {/* Order Timeline removed per request */}

        {/* Order Items */}
        <OrderItemsList items={order.items || []} order={order} />

        {/* Special Instructions */}
        {order.specialInstructions && (
          <div className="bg-yellow-50 rounded-lg p-3">
            <p className="text-sm font-medium text-yellow-800">Special Instructions:</p>
            <p className="text-sm text-yellow-700 mt-1">{order.specialInstructions}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
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