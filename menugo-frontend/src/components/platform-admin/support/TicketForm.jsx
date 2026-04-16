import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQueryClient } from 'react-query'
import Input from '../../../common/Input'
import Textarea from '../../../common/Textarea'
import Select from '../../../common/Select'
import Button from '../../../common/Button'
import { createSupportTicket } from '../../../services/supportService'
import toast from 'react-hot-toast'

const schema = yup.object({
  subject: yup.string().required('Subject is required').min(5, 'Subject must be at least 5 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  priority: yup.string().required('Priority is required'),
  category: yup.string().required('Category is required'),
})

const TicketForm = ({ onSuccess, onCancel }) => {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      priority: 'medium',
      category: 'general',
    },
  })

  const mutation = useMutation(createSupportTicket, {
    onSuccess: () => {
      queryClient.invalidateQueries('supportTickets')
      toast.success('Ticket created successfully')
      reset()
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create ticket')
    },
  })

  const onSubmit = (data) => {
    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Subject" {...register('subject')} error={errors.subject?.message} required />
      
      <Textarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        rows={5}
        required
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Priority"
          {...register('priority')}
          error={errors.priority?.message}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' },
          ]}
        />
        <Select
          label="Category"
          {...register('category')}
          error={errors.category?.message}
          options={[
            { value: 'general', label: 'General' },
            { value: 'technical', label: 'Technical' },
            { value: 'billing', label: 'Billing' },
            { value: 'feature', label: 'Feature Request' },
            { value: 'bug', label: 'Bug Report' },
          ]}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={mutation.isLoading}>
          Create Ticket
        </Button>
      </div>
    </form>
  )
}

export default TicketForm