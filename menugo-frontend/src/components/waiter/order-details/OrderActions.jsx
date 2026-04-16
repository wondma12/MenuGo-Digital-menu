import React, { useState } from 'react'
import { useMutation } from 'react-query'
import Button from '../../common/Button'
import VerifyOrderModal from '../verification/VerifyOrderModal'
import RejectOrderModal from '../verification/RejectOrderModal'
import { updateOrderStatus } from '../../../services/orderService'
import toast from 'react-hot-toast'

const OrderActions = ({ orderId, currentStatus, onRefresh, onClose }) => {
  const [showVerify, setShowVerify] = useState(false)
  const [showReject, setShowReject] = useState(false)

  const updateMutation = useMutation(updateOrderStatus, {
    onSuccess: () => {
      toast.success('Order status updated')
      onRefresh()
      onClose()
    },
    onError: () => toast.error('Failed to update status')
  })

  const handleStatusUpdate = (newStatus) => {
    updateMutation.mutate({ id: orderId, status: newStatus })
  }

  const getActions = () => {
    switch (currentStatus) {
      case 'pending':
        return (
          <div className="flex gap-3">
            <Button variant="danger" onClick={() => setShowReject(true)}>Reject Order</Button>
            <Button variant="primary" onClick={() => setShowVerify(true)}>Verify Order</Button>
          </div>
        )
      case 'verified':
        return (
          <Button variant="warning" onClick={() => handleStatusUpdate('preparing')}>
            Mark as Preparing
          </Button>
        )
      case 'preparing':
        return (
          <Button variant="success" onClick={() => handleStatusUpdate('ready')}>
            Mark as Ready
          </Button>
        )
      case 'ready':
        return (
          <Button variant="primary" onClick={() => handleStatusUpdate('served')}>
            Mark as Served
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <>
      <div className="flex justify-end pt-4 border-t border-gray-200">
        {getActions()}
      </div>

      <VerifyOrderModal
        isOpen={showVerify}
        onClose={() => setShowVerify(false)}
        orderId={orderId}
        onSuccess={() => {
          setShowVerify(false)
          onRefresh()
          onClose()
        }}
      />

      <RejectOrderModal
        isOpen={showReject}
        onClose={() => setShowReject(false)}
        orderId={orderId}
        onSuccess={() => {
          setShowReject(false)
          onRefresh()
          onClose()
        }}
      />
    </>
  )
}

export default OrderActions