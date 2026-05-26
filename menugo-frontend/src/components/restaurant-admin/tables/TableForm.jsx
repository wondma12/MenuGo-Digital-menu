import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Input from '../../../common/Input'
import Select from '../../../common/Select'
import Button from '../../../common/Button'

const schema = yup.object({
  tableNumber: yup.string().required('Table number is required'),
  tableName: yup.string(),
  capacity: yup.number().positive().integer().min(1).required('Capacity is required'),
  section: yup.string(),
  shape: yup.string(),
  width: yup.number().positive().integer(),
  height: yup.number().positive().integer(),
})

const TableForm = ({ table, onSubmit, onCancel, isLoading }) => {
  const isEditing = !!table

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      tableNumber: table?.tableNumber || '',
      tableName: table?.tableName || '',
      capacity: table?.capacity || 4,
      section: table?.section || '',
      shape: table?.shape || 'rectangle',
      width: table?.width || 80,
      height: table?.height || 80,
    },
  })

  const shapeOptions = [
    { value: 'rectangle', label: 'Rectangle' },
    { value: 'circle', label: 'Circle' },
    { value: 'square', label: 'Square' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Table Number"
          {...register('tableNumber')}
          error={errors.tableNumber?.message}
          required
          className="rounded-none border-slate-200 focus:border-orange-300 focus:ring-orange-100"
        />
        <Input
          label="Table Name (Optional)"
          {...register('tableName')}
          error={errors.tableName?.message}
          className="rounded-none border-slate-200 focus:border-orange-300 focus:ring-orange-100"
        />
        <Input
          label="Capacity"
          type="number"
          {...register('capacity', { setValueAs: v => (v === '' ? undefined : Number(v)) })}
          error={errors.capacity?.message}
          required
          className="rounded-none border-slate-200 focus:border-orange-300 focus:ring-orange-100"
        />
        <Input
          label="Section"
          {...register('section')}
          error={errors.section?.message}
          className="rounded-none border-slate-200 focus:border-orange-300 focus:ring-orange-100"
        />
        <Select
          label="Shape"
          {...register('shape')}
          error={errors.shape?.message}
          options={shapeOptions}
          className="rounded-none border-slate-200 focus:border-orange-300 focus:ring-orange-100"
        />
        <Input
          label="Width (px)"
          type="number"
          {...register('width', { setValueAs: v => (v === '' ? undefined : Number(v)) })}
          error={errors.width?.message}
          className="rounded-none border-slate-200 focus:border-orange-300 focus:ring-orange-100"
        />
        <Input
          label="Height (px)"
          type="number"
          {...register('height', { setValueAs: v => (v === '' ? undefined : Number(v)) })}
          error={errors.height?.message}
          className="rounded-none border-slate-200 focus:border-orange-300 focus:ring-orange-100"
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="rounded-none">
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading} className="rounded-none">
          {isEditing ? 'Update Table' : 'Add Table'}
        </Button>
      </div>
    </form>
  )
}

export default TableForm