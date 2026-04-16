import React from 'react'
import { useMutation, useQueryClient } from 'react-query'
import Modal from '../../common/Modal'
import Button from '../../common/Button'
import { acknowledgeCall, resolveCall } from '../../../services/callService'
import toast from 'react-hot-toast'

const CallDetails = ({ isOpen, onClose, call, onRefresh }) => {
  const queryClient = useQueryClient()

  const acknowledgeMutation = useMutation(acknowledgeCall, {
    onSuccess: () => {
      toast.success('Call acknowledged')
      queryClient.invalidateQueries('waiterCalls')
      onRefresh()
      onClose()
    }
  })

  const resolveMutation = useMutation(resolveCall, {
    onSuccess: () => {
      toast.success('Call resolved')
      queryClient.invalidateQueries('waiterCalls')
      onRefresh()
      onClose()
    }
  })

  const getCallTypeIcon = (type) => {
    const icons = {
      service: '🛎️',
      bill: '💰',
      help: '❓',
      food_issue: '🍽️',
      other: '💬'
    }
    return icons[type] || '🔔'
  }

  const getCallTypeLabel = (type) => {
    const labels = {
      service: 'Service Request',
      bill: 'Bill Request',
      help: 'Help / Assistance',
      food_issue: 'Food Issue',
      other: 'Other Request'
    }
    return labels[type] || 'Call Request'
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Call Details" size="md">
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-5xl mb-3">{getCallTypeIcon(call.callType)}</div>
          <h3 className="text-xl font-semibold text-gray-900">{getCallTypeLabel(call.callType)}</h3>
          <p className="text-gray-500">Table {call.tableNumber} • {call.section || 'Main Hall'}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Time:</span>
            <span className="text-gray-700">{new Date(call.createdAt).toLocaleTimeString()}</span>
          </div>
          {call.customerName && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Customer:</span>
              <span className="text-gray-700">{call.customerName}</span>
            </div>
          )}
          {call.notes && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-500">Notes:</span>
              <p className="text-sm text-gray-700 mt-1">{call.notes}</p>
            </div>
          )}
        </div>

        {call.status === 'pending' && (
          <div className="flex gap-3">
            <Button
              onClick={() => acknowledgeMutation.mutate(call.id)}
              isLoading={acknowledgeMutation.isLoading}
              variant="warning"
              fullWidth
            >
              Acknowledge Call
            </Button>
          </div>
        )}

        {call.status === 'acknowledged' && (
          <div className="flex gap-3">
            <Button
              onClick={() => resolveMutation.mutate(call.id)}
              isLoading={resolveMutation.isLoading}
              variant="success"
              fullWidth
            >
              Mark as Resolved
            </Button>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  )
}

export default CallDetails