import React, { useState } from 'react'
import Modal from '../../common/Modal'
import Button from '../../common/Button'
import { useCartStore } from '../../../store/cartStore'
import { createCustomerCall } from '../../../services/callService'
import toast from 'react-hot-toast'

const CallModal = ({ isOpen, onClose, restaurantId }) => {
  const [message, setMessage] = useState('')
  const [callType, setCallType] = useState('service')
  const { tableNumber, setTableNumber } = useCartStore()
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!restaurantId) return toast.error('Restaurant not available')
    if (!tableNumber) return toast.error('Please select or enter your table number')
    setSending(true)
    try {
      await createCustomerCall(restaurantId, {
        table_number: tableNumber,
        call_type: callType,
        customer_name: null,
        notes: message || null,
      })
      toast.success('Call sent to waiter')
      setMessage('')
      onClose()
    } catch (err) {
      console.error('create call failed', err)
      toast.error('Failed to send call')
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Call Waiter" size="sm">
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-700">Table number</label>
          <input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="Enter table number" className="w-full px-3 py-2 border border-gray-300 rounded mt-1" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Reason</label>
          <select value={callType} onChange={(e) => setCallType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded mt-1">
            <option value="service">Service</option>
            <option value="bill">Bill</option>
            <option value="help">Help</option>
            <option value="food_issue">Food issue</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Message (optional)</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded mt-1" rows={3} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose} variant="secondary">Cancel</Button>
          <Button onClick={handleSend} disabled={sending}>{sending ? 'Sending...' : 'Send to waiter'}</Button>
        </div>
      </div>
    </Modal>
  )
}

export default CallModal
