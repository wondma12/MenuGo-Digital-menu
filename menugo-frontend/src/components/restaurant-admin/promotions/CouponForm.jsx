import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Modal from '../../../common/Modal'
import Input from '../../../common/Input'
import Select from '../../../common/Select'
import Textarea from '../../../common/Textarea'
import DatePicker from '../../../common/DatePicker'
import Button from '../../../common/Button'
import { createCoupon, updateCoupon } from '../../../services/promotionService'
import toast from 'react-hot-toast'

const schema = yup.object({
  code: yup.string().required('Coupon code is required').matches(/^[A-Z0-9]+$/, 'Only uppercase letters and numbers'),
  description: yup.string(),
  discountType: yup.string().required('Discount type is required'),
  discountValue: yup.number().positive().required('Discount value is required'),
  minimumOrderAmount: yup.number().positive(),
  usageLimit: yup.number().positive().integer(),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date().required('End date is required').min(yup.ref('startDate'), 'End date must be after start date'),
})

const CouponForm = ({ isOpen, onClose, coupon, onSuccess }) => {
  const isEditing = !!coupon
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      discountType: 'percentage',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  useEffect(() => {
    if (coupon) {
      reset({
        ...coupon,
        startDate: new Date(coupon.startDate),
        endDate: new Date(coupon.endDate),
      })
    }
  }, [coupon, reset])

  const createMutation = useMutation(createCoupon, {
    onSuccess: () => {
      queryClient.invalidateQueries('coupons')
      toast.success('Coupon created successfully')
      onSuccess()
    },
    onError: () => toast.error('Failed to create coupon'),
  })

  const updateMutation = useMutation(updateCoupon, {
    onSuccess: () => {
      queryClient.invalidateQueries('coupons')
      toast.success('Coupon updated successfully')
      onSuccess()
    },
    onError: () => toast.error('Failed to update coupon'),
  })

  const onSubmit = (data) => {
    if (isEditing) {
      updateMutation.mutate({ id: coupon.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const discountTypeOptions = [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed_amount', label: 'Fixed Amount ($)' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Coupon' : 'Create Coupon'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Coupon Code" {...register('code')} error={errors.code?.message} placeholder="WELCOME10" required />
        <Textarea label="Description" {...register('description')} error={errors.description?.message} rows={2} />
        
        <div className="grid grid-cols-2 gap-4">
          <Select label="Discount Type" {...register('discountType')} error={errors.discountType?.message} options={discountTypeOptions} required />
          <Input label="Discount Value" type="number" step="0.01" {...register('discountValue')} error={errors.discountValue?.message} required />
          <Input label="Minimum Order Amount" type="number" step="0.01" {...register('minimumOrderAmount')} error={errors.minimumOrderAmount?.message} />
          <Input label="Usage Limit" type="number" {...register('usageLimit')} error={errors.usageLimit?.message} placeholder="Unlimited if empty" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DatePicker label="Start Date" selected={watch('startDate')} onChange={(date) => setValue('startDate', date)} error={errors.startDate?.message} required />
          <DatePicker label="End Date" selected={watch('endDate')} onChange={(date) => setValue('endDate', date)} error={errors.endDate?.message} required />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={createMutation.isLoading || updateMutation.isLoading}>
            {isEditing ? 'Update Coupon' : 'Create Coupon'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CouponForm