import React from 'react'
import { useMutation, useQueryClient } from 'react-query'
import Modal from '../../common/Modal'
import Button from '../../common/Button'
import Textarea from '../../common/Textarea'
import { acknowledgeCall } from '../../../services/callService'
import toast from 'react-hot-toast'

const AcknowledgeCall = ({ isOpen, onClose, call, onSuccess }) => {
  const [notes, setNotes] = React.useState('')

  const mutation = useMutation(acknowledgeCall, {
    onSuccess: () => {
      toast.success('Call acknowledged successfully')
      onSuccess?.()
      onClose()
    },
    onError: () => toast.error('Failed to acknowledge call')
  })

  const handleSubmit = () => {
    mutation.mutate({
      callId: call.id,
      notes
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Acknowledge Call" size="md">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Table:</span>
            <span className="font-medium text-gray-900">{call?.tableNumber}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Type:</span>
            <span className="text-gray-700">{call?.callType}</span>
          </div>
          {call?.notes && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-500">Customer Note:</span>
              <p className="text-sm text-gray-700 mt-1">{call.notes}</p>
            </div>
          )}
        </div>

        <Textarea
          label="Response Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Let the customer know you're on your way..."
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={mutation.isLoading}>
            Acknowledge & Respond
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default AcknowledgeCall