import React, { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import Modal from '../../common/Modal'
import Select from '../../common/Select'
import Button from '../../common/Button'
import { assignTableToWaiter, getAvailableWaiters } from '../../../services/tableService'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'

const TableAssignment = ({ isOpen, onClose, table, onSuccess }) => {
  const [selectedWaiter, setSelectedWaiter] = useState('')
  const [reason, setReason] = useState('')

  const { data: waiters } = useQuery('availableWaiters', getAvailableWaiters)

  const mutation = useMutation(assignTableToWaiter, {
    onSuccess: () => {
      toast.success(`Table ${table?.tableNumber} assigned successfully`)
      onSuccess?.()
      onClose()
    },
    onError: () => toast.error('Failed to assign table')
  })

  const handleSubmit = () => {
    if (selectedWaiter) {
      mutation.mutate({
        tableId: table.id,
        waiterId: selectedWaiter,
        reason
      })
    } else {
      toast.error('Please select a waiter')
    }
  }

  const waiterOptions = waiters?.map(w => ({
    value: w.id,
    label: `${w.name} (${w.currentOrders} active orders)`
  })) || []

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Table ${table?.tableNumber}`} size="md">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Table:</span>
            <span className="font-medium text-gray-900">{table?.tableNumber} - {table?.tableName || 'No name'}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Section:</span>
            <span className="text-gray-700">{table?.section || 'General'}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Capacity:</span>
            <span className="text-gray-700">{table?.capacity} persons</span>
          </div>
        </div>

        <Select
          label="Select Waiter"
          value={selectedWaiter}
          onChange={(e) => setSelectedWaiter(e.target.value)}
          options={waiterOptions}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={2}
            placeholder="e.g., Shift change, New assignment..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={mutation.isLoading}>
            Assign Table
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default TableAssignment