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
        <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-white to-orange-50/40 p-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Table:</span>
            <span className="font-semibold text-slate-900">{table?.tableNumber} - {table?.tableName || 'No name'}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-slate-500">Section:</span>
            <span className="text-slate-700">{table?.section || 'General'}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-slate-500">Capacity:</span>
            <span className="text-slate-700">{table?.capacity} persons</span>
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
          <label className="mb-1 block text-sm font-semibold text-slate-700">Reason (Optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-orange-100"
            rows={2}
            placeholder="e.g., Shift change, New assignment..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={mutation.isLoading} className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600">
            Assign Table
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default TableAssignment