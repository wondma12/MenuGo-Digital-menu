import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQuery } from 'react-query'
import Input from '../../../common/Input'
import Select from '../../../common/Select'
import Button from '../../../common/Button'
import Loading from '../../../common/Loading'
import { createUser, updateUser, getUserDetails } from '../../../services/userService'
import toast from 'react-hot-toast'

const schema = yup.object({
  fullName: yup.string().required('Full name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string(),
  role: yup.string().required('Role is required'),
  restaurantName: yup.string().when('role', {
    is: 'restaurant_admin',
    then: (schema) => schema.required('Restaurant name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  password: yup.string().when('$isEditing', {
    is: false,
    then: (schema) => schema.required('Password is required').min(6, 'Password must be at least 6 characters'),
    otherwise: (schema) => schema.notRequired(),
  }),
  confirmPassword: yup.string().when('password', {
    is: (val) => val && val.length > 0,
    then: (schema) => schema.oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
  }),
})

const UserForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const { data: user, isLoading: isLoadingUser } = useQuery(
    ['user', id],
    () => getUserDetails(id),
    { enabled: isEditing }
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    context: { isEditing },
    defaultValues: {
      role: 'customer',
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      })
    }
  }, [user, reset])

  const currentRole = watch('role')

  const createMutation = useMutation(createUser, {
    onSuccess: () => {
      toast.success('User created successfully')
      navigate('/platform/users')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create user')
    },
  })

  const updateMutation = useMutation(updateUser, {
    onSuccess: () => {
      toast.success('User updated successfully')
      navigate('/platform/users')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user')
    },
  })

  const onSubmit = (data) => {
    if (isEditing) {
      updateMutation.mutate({ id, data })
    } else {
      // Map form fields to backend expected payload
      const payload = {
        email: data.email,
        password: data.password,
        role: data.role,
        full_name: data.fullName,
        phone: data.phone,
      }

      if (data.restaurantName) payload.restaurant_name = data.restaurantName

      createMutation.mutate(payload)
    }
  }

  if (isEditing && isLoadingUser) return <Loading />

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit User' : 'Create New User'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEditing ? 'Update user information' : 'Add a new user to the platform'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
        <Input label="Full Name" {...register('fullName')} error={errors.fullName?.message} required />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} required />
        <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
        
        <Select
          label="Role"
          {...register('role')}
          error={errors.role?.message}
          options={[
            { value: 'customer', label: 'Customer' },
            { value: 'waiter', label: 'Waiter' },
            { value: 'restaurant_admin', label: 'Restaurant Admin' },
            { value: 'support_agent', label: 'Support Agent' },
            { value: 'platform_admin', label: 'Platform Admin' },
          ]}
          required
        />

        {currentRole === 'restaurant_admin' && (
          <Input label="Restaurant Name" {...register('restaurantName')} error={errors.restaurantName?.message} required />
        )}

        {!isEditing && (
          <>
            <Input label="Password" type="password" {...register('password')} error={errors.password?.message} required />
            <Input label="Confirm Password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} required />
          </>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/platform/users')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isLoading || updateMutation.isLoading}>
            {isEditing ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default UserForm