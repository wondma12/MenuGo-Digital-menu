import {useState, useEffect} from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Modal from '../../../common/Modal'
import Input from '../../../common/Input'
import Select from '../../../common/Select'
import Textarea from '../../../common/Textarea'
import Button from '../../../common/Button'
import { createInventoryItem, updateInventoryItem } from '../../../services/inventoryService'
import toast from 'react-hot-toast'

const schema = yup.object({
  name: yup.string().required('Item name is required'),
  description: yup.string(),
  category: yup.string().required('Category is required'),
  unit: yup.string().required('Unit is required'),
  quantity: yup.number().min(0).required('Quantity is required'),
  reorderLevel: yup.number().min(0).required('Reorder level is required'),
  costPerUnit: yup.number().positive().required('Cost per unit is required'),
  supplier: yup.string(),
})

const InventoryForm = ({ isOpen, onClose, item, onSuccess }) => {
  const isEditing = !!item
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      category: 'raw',
      unit: 'kg',
      quantity: 0,
      reorderLevel: 10,
    },
  })

  useEffect(() => {
    if (item) {
      reset(item)
    }
  }, [item, reset])

  const createMutation = useMutation(createInventoryItem, {
    onSuccess: () => {
      queryClient.invalidateQueries('inventory')
      toast.success('Inventory item added successfully')
      onSuccess()
    },
    onError: () => toast.error('Failed to add item'),
  })

  const updateMutation = useMutation(updateInventoryItem, {
    onSuccess: () => {
      queryClient.invalidateQueries('inventory')
      toast.success('Inventory item updated successfully')
      onSuccess()
    },
    onError: () => toast.error('Failed to update item'),
  })

  const onSubmit = (data) => {
    if (isEditing) {
      updateMutation.mutate({ id: item.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const categoryOptions = [
    { value: 'raw', label: 'Raw Materials' },
    { value: 'beverage', label: 'Beverages' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'other', label: 'Other' },
  ]

  const unitOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'l', label: 'Liter (L)' },
    { value: 'ml', label: 'Milliliter (ml)' },
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'box', label: 'Box' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Inventory Item' : 'Add Inventory Item'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Item Name" {...register('name')} error={errors.name?.message} required />
        <Textarea label="Description" {...register('description')} error={errors.description?.message} rows={2} />
        
        <div className="grid grid-cols-2 gap-4">
          <Select label="Category" {...register('category')} error={errors.category?.message} options={categoryOptions} required />
          <Select label="Unit" {...register('unit')} error={errors.unit?.message} options={unitOptions} required />
          <Input label="Current Quantity" type="number" step="0.01" {...register('quantity')} error={errors.quantity?.message} required />
          <Input label="Reorder Level" type="number" step="0.01" {...register('reorderLevel')} error={errors.reorderLevel?.message} required />
          <Input label="Cost per Unit ($)" type="number" step="0.01" {...register('costPerUnit')} error={errors.costPerUnit?.message} required />
          <Input label="Supplier" {...register('supplier')} error={errors.supplier?.message} />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={createMutation.isLoading || updateMutation.isLoading}>
            {isEditing ? 'Update Item' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default InventoryForm