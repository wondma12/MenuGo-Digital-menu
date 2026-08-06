import {useState} from 'react'
import { useMutation } from 'react-query'
import Button from '../../common/Button'
import RejectOrderModal from '../verification/RejectOrderModal'
import { updateOrderStatus } from '../../../services/orderService'
import { verifyOrder } from '../../../services/orderService'
import { useWebSocket } from '../../../hooks/useWebSocket'
import toast from 'react-hot-toast'

const OrderActions = ({ orderId, currentStatus, onRefresh, onClose }) => {
  const [showVerify, setShowVerify] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const updateMutation = useMutation(updateOrderStatus, {
    onSuccess: () => {
      toast.success('Order status updated')
      onRefresh()
      onClose()
    },
    onError: () => toast.error('Failed to update status')
  })

  const { sendMessage } = useWebSocket()

  const verifyAndSend = async () => {
    try {
      setIsVerifying(true)
      // Call verify API (manual)
      const verified = await verifyOrder(orderId, 'manual')
      // Prepare payload: use full verified order if available, otherwise fallback to minimal id
      let orderPayload = { order_id: orderId }
      if (verified && typeof verified === 'object') {
        if (verified.id || verified.order_id || verified.orderId) {
          orderPayload = verified
        } else if (verified.data && (verified.data.id || verified.data.order_id)) {
          orderPayload = verified.data
        }
      }

      toast.success('Order verified and sent to kitchen')
      onRefresh()
      onClose()
    } catch (err) {
      toast.error('Failed to verify and send to kitchen')
      throw err
    } finally {
      setIsVerifying(false)
    }
  }

  const handleStatusUpdate = (newStatus) => {
    updateMutation.mutate({ id: orderId, status: newStatus })
  }

  const getActions = () => {
    switch (currentStatus) {
      case 'pending':
        return (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button variant="danger" className="w-full sm:w-auto" onClick={() => setShowReject(true)}>Reject Order</Button>
            <Button variant="secondary" className="w-full sm:w-auto" onClick={verifyAndSend} isLoading={isVerifying} disabled={isVerifying}>Verify & Send to Kitchen</Button>
          </div>
        )
      case 'verified':
        return null
      case 'preparing':
        return (
          <Button variant="success" onClick={() => handleStatusUpdate('ready')}>
            Mark as Ready
          </Button>
        )
      case 'ready':
        return (
          <Button variant="primary" onClick={() => handleStatusUpdate('completed')}>
            Mark as Completed
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <>
      <div className="flex justify-end pt-3 border-t border-gray-200">
        {getActions()}
      </div>

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