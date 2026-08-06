import {useState} from 'react'
import { useMutation } from 'react-query'
import Modal from '../../common/Modal'
import Button from '../../common/Button'
import Textarea from '../../common/Textarea'
import Select from '../../common/Select'
import { rejectOrder } from '../../../services/orderService'
import toast from 'react-hot-toast'

const RejectOrderModal = ({ isOpen, onClose, orderId, onSuccess }) => {
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  const rejectMutation = useMutation(({ id, reason, notes }) => rejectOrder(id, reason, notes), {
    onSuccess: () => {
      toast.success('Order rejected')
      onSuccess()
    },
    onError: () => toast.error('Failed to reject order')
  })

  const rejectionReasons = [
    { value: 'invalid_table', label: 'Invalid Table Number' },
    { value: 'duplicate', label: 'Duplicate Order' },
    { value: 'unavailable', label: 'Items Unavailable' },
    { value: 'payment', label: 'Payment Issue' },
    { value: 'other', label: 'Other' }
  ]

  const handleSubmit = () => {
    if (reason) {
      rejectMutation.mutate({ id: orderId, reason, notes })
    } else {
      toast.error('Please select a reason')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Order" size="md">
      <div className="space-y-4">
        <Select
          label="Rejection Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={rejectionReasons}
          required
        />
        <Textarea
          label="Additional Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Provide additional details..."
        />
        <div className="flex gap-3 justify-end pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={handleSubmit} isLoading={rejectMutation.isLoading}>
            Reject Order
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default RejectOrderModal