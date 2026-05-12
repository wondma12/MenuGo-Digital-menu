import React, { useState } from 'react'
import { useMutation } from 'react-query'
import Modal from '../../common/Modal'
import Button from '../../common/Button'
import Input from '../../common/Input'
import QRVerification from './QRVerification'
import ManualVerification from './ManualVerification'
import { verifyOrder } from '../../../services/orderService'
import { useWebSocket } from '../../../hooks/useWebSocket'
import toast from 'react-hot-toast'

const VerifyOrderModal = ({ isOpen, onClose, orderId, onSuccess }) => {
  const [method, setMethod] = useState('manual')
  const [verificationCode, setVerificationCode] = useState('')

  const { sendMessage } = useWebSocket()

  const verifyMutation = useMutation(({ id, method, code }) => verifyOrder(id, method, code), {
    onSuccess: () => {
      toast.success('Order verified successfully')
      // Notify kitchen immediately via socket helper (server will emit to restaurant/kitchen rooms)
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}') || {}
        const restaurantId = user.restaurantId || user.restaurant_id || (user.restaurant && user.restaurant.id) || null
        if (sendMessage && restaurantId) {
          sendMessage('emit-new-order', { restaurantId, orderData: { order_id: orderId } })
        }
      } catch (e) {
        // ignore socket errors
      }

      onSuccess()
    },
    onError: () => toast.error('Verification failed')
  })

  const handleVerify = () => {
    verifyMutation.mutate({
      id: orderId,
      method,
      code: method === 'qr_code' ? verificationCode : undefined
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verify Order" size="md">
      <div className="space-y-4">
        <div className="flex gap-3 border-b border-gray-200 pb-3">
          <button
            onClick={() => setMethod('manual')}
            className={`px-3 py-1.5 rounded-lg text-sm ${method === 'manual' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Manual Verification
          </button>
          <button
            onClick={() => setMethod('qr_code')}
            className={`px-3 py-1.5 rounded-lg text-sm ${method === 'qr_code' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            QR Code Verification
          </button>
        </div>

        {method === 'manual' ? (
          <ManualVerification />
        ) : (
          <QRVerification onCodeScanned={setVerificationCode} />
        )}

        {method === 'manual' && (
          <div className="pt-4">
            <Button
              onClick={handleVerify}
              isLoading={verifyMutation.isLoading}
              fullWidth
            >
              Confirm Verification
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default VerifyOrderModal