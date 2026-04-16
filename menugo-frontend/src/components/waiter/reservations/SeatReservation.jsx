import React, { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import Modal from '../../common/Modal'
import Select from '../../common/Select'
import Button from '../../common/Button'
import { seatReservation, getAvailableTables } from '../../../services/reservationService'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'

const SeatReservation = ({ isOpen, onClose, reservation, onSuccess }) => {
  const [selectedTable, setSelectedTable] = useState('')
  const [notes, setNotes] = useState('')

  const { data: tables } = useQuery(['availableTables', reservation?.partySize], 
    () => getAvailableTables(reservation?.partySize),
    { enabled: isOpen && !!reservation }
  )

  const mutation = useMutation(seatReservation, {
    onSuccess: () => {
      toast.success(`Reservation for ${reservation?.customerName} seated successfully`)
      onSuccess()
    },
    onError: () => toast.error('Failed to seat reservation')
  })

  const handleSubmit = () => {
    if (selectedTable) {
      mutation.mutate({
        reservationId: reservation.id,
        tableId: selectedTable,
        notes
      })
    } else {
      toast.error('Please select a table')
    }
  }

  const tableOptions = tables?.map(t => ({
    value: t.id,
    label: `Table ${t.tableNumber} (${t.capacity} seats) - ${t.section || 'General'}`
  })) || []

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Seat Reservation - ${reservation?.customerName}`} size="md">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Party Size:</span>
            <span className="font-medium text-gray-900">{reservation?.partySize} guests</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Time:</span>
            <span className="text-gray-700">{reservation?.reservationTime}</span>
          </div>
          {reservation?.specialRequests && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-500">Special Requests:</span>
              <p className="text-sm text-gray-700 mt-1">{reservation.specialRequests}</p>
            </div>
          )}
        </div>

        <Select
          label="Select Table"
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          options={tableOptions}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={2}
            placeholder="Add any notes about this seating..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={mutation.isLoading}>
            Seat Guest
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default SeatReservation