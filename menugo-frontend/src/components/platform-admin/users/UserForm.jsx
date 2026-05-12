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
import axios from 'axios'

const schema = yup.object({
  fullName: yup.string().required('Full name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup.string(),
  role: yup.string().required('Role is required'),
  restaurantName: yup.string().when('role', {
    is: 'restaurant_admin',
    then: (schema) => schema.required('Restaurant name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  businessEmail: yup.string().when('role', {
    is: 'restaurant_admin',
    then: (schema) => schema.required('Business email is required').email('Invalid email'),
    otherwise: (schema) => schema.notRequired(),
  }),
  businessPhone: yup.string().when('role', {
    is: 'restaurant_admin',
    then: (schema) => schema.required('Business phone is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  country: yup.string().when('role', {
    is: 'restaurant_admin',
    then: (schema) => schema.required('Country is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  city: yup.string().when('role', {
    is: 'restaurant_admin',
    then: (schema) => schema.required('City is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  subCity: yup.string().when('role', {
    is: 'restaurant_admin',
    then: (schema) => schema.required('Sub-city/District is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  streetAddress: yup.string().when('role', {
    is: 'restaurant_admin',
    then: (schema) => schema.required('Street address is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  googleMapsLink: yup.string().when('role', {
    is: 'restaurant_admin',
    then: (schema) => schema.required('Google Maps link is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  ownerName: yup.string().when('role', {
    is: 'restaurant_admin',
    then: (schema) => schema.required('Owner name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  businessLicenseNumber: yup.string().when('role', {
    is: 'restaurant_admin',
    then: (schema) => schema.required('Business license number is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  tinNumber: yup.string().when('role', {
    is: 'restaurant_admin',
    then: (schema) => schema.required('TIN number is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  slogan: yup.string(),
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
      phoneNumber: '',
      restaurantName: '',
      businessEmail: '',
      businessPhone: '',
      country: '',
      city: '',
      subCity: '',
      streetAddress: '',
      googleMapsLink: '',
      ownerName: '',
      businessLicenseNumber: '',
      tinNumber: '',
      slogan: '',
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phone,
        role: user.role,
        restaurantName: user.restaurantName || user.restaurant_name || '',
        businessEmail: user.businessEmail || user.business_email || '',
        businessPhone: user.businessPhone || user.restaurant_phone || '',
        country: user.country || user.restaurant_country || '',
        city: user.city || user.restaurant_city || '',
        subCity: user.subCity || user.restaurant_sub_city || '',
        streetAddress: user.streetAddress || user.restaurant_address || '',
        googleMapsLink: user.googleMapsLink || user.restaurant_website || '',
        ownerName: user.ownerName || user.owner_name || '',
        businessLicenseNumber: user.businessLicenseNumber || user.business_license_number || '',
        tinNumber: user.tinNumber || user.tin_number || '',
        slogan: user.slogan || user.restaurant_slogan || '',
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

  const [licenseFile, setLicenseFile] = useState(null)

  const onSubmit = async (data) => {
    if (isEditing) {
      updateMutation.mutate({ id, data })
      return
    }

    // Map form fields to backend expected payload
    const payload = {
      email: data.email,
      password: data.password,
      role: data.role,
      full_name: data.fullName,
      phone: data.phoneNumber || data.phone,
    }

    if (data.restaurantName) payload.restaurant_name = data.restaurantName
    if (data.businessEmail) payload.business_email = data.businessEmail
    if (data.businessPhone) payload.restaurant_phone = data.businessPhone
    if (data.country) payload.restaurant_country = data.country
    if (data.city) payload.restaurant_city = data.city
    if (data.subCity) payload.restaurant_sub_city = data.subCity
    if (data.streetAddress) payload.restaurant_address = data.streetAddress
    if (data.googleMapsLink) payload.restaurant_website = data.googleMapsLink
    if (data.slogan) payload.restaurant_slogan = data.slogan
    if (data.ownerName) payload.owner_name = data.ownerName
    if (data.businessLicenseNumber) payload.business_license_number = data.businessLicenseNumber
    if (data.tinNumber) payload.tin_number = data.tinNumber

    try {
      const res = await createMutation.mutateAsync(payload)

      // If a license file was provided and a restaurant was created, upload it and attach to restaurant
      const restaurant = res?.data?.restaurant || res?.restaurant || res?.data?.restaurant
      if (licenseFile && restaurant && restaurant.id) {
        const form = new FormData()
        form.append('businessLicenseDocument', licenseFile)
        form.append('restaurant_id', restaurant.id)
        await axios.post('/api/users/me/business-license', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
    } catch (err) {
      // createMutation handles toast on error, just rethrow or log
      console.error(err)
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
        <Input label="Phone" {...register('phoneNumber')} error={errors.phoneNumber?.message} />
        
        <Select
          label="Role"
          {...register('role')}
          error={errors.role?.message}
          options={[
            // { value: 'customer', label: 'Customer' },
            // { value: 'waiter', label: 'Waiter' },
            { value: 'restaurant_admin', label: 'Restaurant Admin' },
            // { value: 'support_agent', label: 'Support Agent' },
            { value: 'platform_admin', label: 'Platform Admin' },
          ]}
          required
        />

        {currentRole === 'restaurant_admin' && (
          <div className="space-y-3">
            <Input label="Restaurant Name" {...register('restaurantName')} error={errors.restaurantName?.message} required />
            <Input label="Business Email" type="email" {...register('businessEmail')} error={errors.businessEmail?.message} required />
            <Input label="Business Phone" {...register('businessPhone')} error={errors.businessPhone?.message} required />
            <Input label="Country" {...register('country')} error={errors.country?.message} required />
            <Input label="City" {...register('city')} error={errors.city?.message} required />
            <Input label="Sub-city / District" {...register('subCity')} error={errors.subCity?.message} required />
            <Input label="Street Address" {...register('streetAddress')} error={errors.streetAddress?.message} required />
            <Input label="Google Maps Link" {...register('googleMapsLink')} error={errors.googleMapsLink?.message} required />
            <Input label="Owner Name" {...register('ownerName')} error={errors.ownerName?.message} required />
            <Input label="Business License Number" {...register('businessLicenseNumber')} error={errors.businessLicenseNumber?.message} required />
            <Input label="TIN Number" {...register('tinNumber')} error={errors.tinNumber?.message} required />
            <Input label="Slogan" {...register('slogan')} error={errors.slogan?.message} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business License Document</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setLicenseFile(e.target.files[0])}
                className="block w-full text-sm text-gray-700"
              />
            </div>
          </div>
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