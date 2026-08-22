import {useState, useEffect} from 'react'
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
  subscriptionPlan: yup.string().when('role', {
    is: 'restaurant_admin',
    then: (schema) => schema.required('Subscription plan is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  restaurantName: yup.string().when('role', {
    is: 'restaurant_admin',
    then: (schema) => schema.required('Restaurant name is required'),
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
      subscriptionPlan: 'monthly',
      phoneNumber: '',
      restaurantName: '',
      country: '',
      city: '',
      subCity: '',
      streetAddress: '',
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
        subscriptionPlan: user.subscriptionPlan || user.subscription_plan || 'monthly',
        restaurantName: user.restaurantName || user.restaurant_name || '',
        country: user.country || user.restaurant_country || '',
        city: user.city || user.restaurant_city || '',
        subCity: user.subCity || user.restaurant_sub_city || '',
        streetAddress: user.streetAddress || user.restaurant_address || '',
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
    if (data.subscriptionPlan) payload.subscription_plan = data.subscriptionPlan
    if (data.country) payload.restaurant_country = data.country
    if (data.city) payload.restaurant_city = data.city
    if (data.subCity) payload.restaurant_sub_city = data.subCity
    if (data.streetAddress) payload.restaurant_address = data.streetAddress
    if (data.slogan) payload.restaurant_slogan = data.slogan
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
    <div className="mx-auto max-w-2xl space-y-6 bg-white p-4 font-['Manrope',system-ui,sans-serif] text-slate-900 sm:p-6 lg:p-8">
      <div className="relative overflow-hidden rounded-none border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,146,60,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.08),transparent_55%)]" />
        <div className="relative">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Users</p>
        <h1 className="mt-1.5 text-2xl font-black tracking-tight text-slate-900">
          {isEditing ? 'Edit User' : 'Create New User'}
        </h1>
        <p className="mt-1 text-slate-500">
          {isEditing ? 'Update user information' : 'Add a new user to the platform'}
        </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-none border border-orange-100 bg-white p-6 shadow-sm">
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
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Subscription Plan *</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer transition-colors hover:border-orange-400 has-[:checked]:border-orange-600 has-[:checked]:bg-orange-50">
                  <input type="radio" value="monthly" {...register('subscriptionPlan')} className="accent-orange-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Monthly</p>
                    <p className="text-xs text-slate-500">Renews every month</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer transition-colors hover:border-orange-400 has-[:checked]:border-orange-600 has-[:checked]:bg-orange-50">
                  <input type="radio" value="six_months" {...register('subscriptionPlan')} className="accent-orange-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">6 Months</p>
                    <p className="text-xs text-slate-500">Save up to 10%</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer transition-colors hover:border-orange-400 has-[:checked]:border-orange-600 has-[:checked]:bg-orange-50">
                  <input type="radio" value="yearly" {...register('subscriptionPlan')} className="accent-orange-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Yearly</p>
                    <p className="text-xs text-slate-500">Save up to 20%</p>
                  </div>
                </label>
              </div>
              {errors.subscriptionPlan?.message && <p className="mt-1 text-xs text-red-600">{errors.subscriptionPlan.message}</p>}
            </div>
            <Input label="Country" {...register('country')} error={errors.country?.message} required />
            <Input label="City" {...register('city')} error={errors.city?.message} required />
            <Input label="Sub-city / District" {...register('subCity')} error={errors.subCity?.message} required />
            <Input label="Street Address" {...register('streetAddress')} error={errors.streetAddress?.message} required />
            <Input label="Business License Number" {...register('businessLicenseNumber')} error={errors.businessLicenseNumber?.message} required />
            <Input label="TIN Number" {...register('tinNumber')} error={errors.tinNumber?.message} required />
            <Input label="Slogan" {...register('slogan')} error={errors.slogan?.message} />
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Business License Document</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setLicenseFile(e.target.files[0])}
                className="block w-full text-sm text-slate-700"
              />
            </div>
          </div>
        )}

        {!isEditing && (
          <>
            <Input label="Password" type="password" autoComplete="new-password" {...register('password')} error={errors.password?.message} required />
            <Input label="Confirm Password" type="password" autoComplete="new-password" {...register('confirmPassword')} error={errors.confirmPassword?.message} required />
          </>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/platform/users')} className="rounded-none">
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isLoading || updateMutation.isLoading} className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600">
            {isEditing ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default UserForm