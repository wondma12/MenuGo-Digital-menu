import React, { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import Modal from '../../../common/Modal'
import Input from '../../../common/Input'
import Select from '../../../common/Select'
import Textarea from '../../../common/Textarea'
import Button from '../../../common/Button'
import { adjustStock } from '../../../services/inventoryService'
import toast from 'react-hot-toast'

const StockAdjustment = ({ isOpen, onClose, item, onSuccess }) => {
  const [quantity, setQuantity] = useState(0)
  const [type, setType] = useState('add')
  const [reason, setReason] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation(adjustStock, {
    onSuccess: () => {
      queryClient.invalidateQueries('inventory')
      toast.success(`Stock ${type === 'add' ? 'added' : 'removed'} successfully`)
      onSuccess()
      onClose()
    },
    onError: () => toast.error('Failed to adjust stock'),
  })

  const handleSubmit = () => {
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0')
      return
    }
    mutation.mutate({
      itemId: item.id,
      quantity: type === 'add' ? quantity : -quantity,
      reason,
    })
  }

  const typeOptions = [
    { value: 'add', label: 'Add Stock (Purchase, Return)' },
    { value: 'remove', label: 'Remove Stock (Usage, Waste, Damage)' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adjust Stock - ${item?.name}`} size="md">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Current Stock:</span>
            <span className="font-semibold">{item?.quantity} {item?.unit}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Reorder Level:</span>
            <span className="text-gray-600">{item?.reorderLevel} {item?.unit}</span>
          </div>
        </div>

        <Select label="Adjustment Type" value={type} onChange={(e) => setType(e.target.value)} options={typeOptions} />
        
        <Input
          label={`Quantity to ${type === 'add' ? 'Add' : 'Remove'}`}
          type="number"
          step="0.01"
          value={quantity}
          onChange={(e) => setQuantity(parseFloat(e.target.value))}
          required
        />
        
        <Textarea
          label="Reason for Adjustment"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g., New shipment received, damaged goods, etc."
          rows={3}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={mutation.isLoading}>
            Confirm {type === 'add' ? 'Addition' : 'Removal'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default StockAdjustment