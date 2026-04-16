import React, { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import Modal from '../../common/Modal'
import Select from '../../common/Select'
import Button from '../../common/Button'
import { transferTable, getAvailableWaiters } from '../../../services/tableService'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'

const TableTransfer = ({ isOpen, onClose, table, onSuccess }) => {
  const [selectedWaiter, setSelectedWaiter] = useState('')
  const [reason, setReason] = useState('')

  const { data: waiters } = useQuery('availableWaiters', getAvailableWaiters)

  const mutation = useMutation(transferTable, {
    onSuccess: () => {
      toast.success(`Table ${table?.tableNumber} transferred successfully`)
      onSuccess?.()
      onClose()
    },
    onError: () => toast.error('Failed to transfer table')
  })

  const currentWaiter = table?.currentWaiter

  const waiterOptions = waiters
    ?.filter(w => w.id !== currentWaiter?.id)
    .map(w => ({
      value: w.id,
      label: `${w.name} (${w.currentOrders} active orders)`
    })) || []

  const handleSubmit = () => {
    if (selectedWaiter) {
      mutation.mutate({
        tableId: table.id,
        fromWaiterId: currentWaiter?.id,
        toWaiterId: selectedWaiter,
        reason
      })
    } else {
      toast.error('Please select a waiter')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Transfer Table ${table?.tableNumber}`} size="md">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Current Waiter:</span>
            <span className="font-medium text-gray-900">{currentWaiter?.name || 'Unassigned'}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Table Status:</span>
            <span className="text-gray-700 capitalize">{table?.status}</span>
          </div>
          {table?.currentCustomerName && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Current Customer:</span>
              <span className="text-gray-700">{table.currentCustomerName}</span>
            </div>
          )}
        </div>

        <Select
          label="Transfer To"
          value={selectedWaiter}
          onChange={(e) => setSelectedWaiter(e.target.value)}
          options={waiterOptions}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Transfer</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={2}
            placeholder="e.g., Waiter shift end, Customer request..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={mutation.isLoading}>
            Transfer Table
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default TableTransfer