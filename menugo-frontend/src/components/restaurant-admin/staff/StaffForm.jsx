import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Input from '../../../common/Input'
import Select from '../../../common/Select'
import Button from '../../../common/Button'
import FileUpload from '../../../common/FileUpload'
import { uploadFile } from '../../../services/uploadService'
import toast from 'react-hot-toast'

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  role: yup.string().required('Role is required'),
  shiftStart: yup.string().required('Shift start time is required'),
  shiftEnd: yup.string().required('Shift end time is required'),
  hourlyRate: yup.number().positive(),
  password: yup.string().when('$isEditing', {
    is: false,
    then: (schema) => schema.required('Password is required').min(6, 'Password must be at least 6 characters'),
  }),
})

const StaffForm = ({ staff, onSubmit, onCancel, isLoading }) => {
  const isEditing = !!staff
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(staff?.avatar || null)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      role: 'waiter',
      shiftStart: '09:00',
      shiftEnd: '17:00',
    },
  })

  useEffect(() => {
    if (staff) {
      reset({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        shiftStart: staff.shiftStart,
        shiftEnd: staff.shiftEnd,
        hourlyRate: staff.hourlyRate,
      })
      setAvatarPreview(staff.avatar)
    }
  }, [staff, reset])

  const handleAvatarUpload = async (files) => {
    if (files[0]) {
      setIsUploading(true)
      try {
        const result = await uploadFile(files[0], 'staff-avatars')
        setAvatarFile(result.url)
        setAvatarPreview(URL.createObjectURL(files[0]))
      } catch (error) {
        toast.error('Failed to upload avatar')
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      avatar: avatarFile || avatarPreview,
    })
  }

  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'waiter', label: 'Waiter' },
    { value: 'chef', label: 'Chef' },
  ]

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Full Name" {...register('name')} error={errors.name?.message} required className="rounded-none border-slate-200 focus:border-orange-300 focus:ring-orange-100" />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} required className="rounded-none border-slate-200 focus:border-orange-300 focus:ring-orange-100" />
        <Input label="Phone" {...register('phone')} error={errors.phone?.message} required className="rounded-none border-slate-200 focus:border-orange-300 focus:ring-orange-100" />
        <Select label="Role" {...register('role')} error={errors.role?.message} options={roleOptions} required className="rounded-none border-slate-200 focus:border-orange-300 focus:ring-orange-100" />
        <Input label="Shift Start" type="time" {...register('shiftStart')} error={errors.shiftStart?.message} required className="rounded-none border-slate-200 focus:border-orange-300 focus:ring-orange-100" />
        <Input label="Shift End" type="time" {...register('shiftEnd')} error={errors.shiftEnd?.message} required className="rounded-none border-slate-200 focus:border-orange-300 focus:ring-orange-100" />
        <Input label="Hourly Rate ($)" type="number" step="0.01" {...register('hourlyRate')} error={errors.hourlyRate?.message} className="rounded-none border-slate-200 focus:border-orange-300 focus:ring-orange-100" />
        {!isEditing && (
          <>
            <Input label="Password" type="password" {...register('password')} error={errors.password?.message} required className="rounded-none border-slate-200 focus:border-orange-300 focus:ring-orange-100" />
          </>
        )}
      </div>

      <FileUpload
        label="Profile Picture"
        onFileSelect={handleAvatarUpload}
        accept={{ 'image/*': ['.jpeg', '.png', '.jpg'] }}
      />
      {avatarPreview && (
        <img src={avatarPreview} alt="Preview" className="h-16 w-16 rounded-none object-cover" />
      )}

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="rounded-none">Cancel</Button>
        <Button type="submit" isLoading={isLoading || isUploading} className="rounded-none">
          {isEditing ? 'Update Staff' : 'Add Staff'}
        </Button>
      </div>
    </form>
  )
}

export default StaffForm