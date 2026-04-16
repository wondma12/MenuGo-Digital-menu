import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import Input from '../../../common/Input'
import Textarea from '../../../common/Textarea'
import Button from '../../../common/Button'
import FileUpload from '../../../common/FileUpload'
import { updateRestaurantProfile } from '../../../services/restaurantService'
import { uploadFile } from '../../../services/uploadService'
import toast from 'react-hot-toast'

const RestaurantProfile = ({ settings }) => {
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(settings?.logoUrl)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(settings?.coverImageUrl)
  const [isUploading, setIsUploading] = useState(false)
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: settings?.name || '',
      description: settings?.description || '',
      phone: settings?.phone || '',
      email: settings?.email || '',
      address: settings?.address || '',
      city: settings?.city || '',
      state: settings?.state || '',
      postalCode: settings?.postalCode || '',
      website: settings?.website || '',
    },
  })

  const mutation = useMutation(updateRestaurantProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries('restaurantSettings')
      toast.success('Profile updated successfully')
    },
    onError: () => toast.error('Failed to update profile'),
  })

  const handleLogoUpload = async (files) => {
    if (files[0]) {
      setIsUploading(true)
      try {
        const result = await uploadFile(files[0], 'restaurant-logos')
        setLogoFile(result.url)
        setLogoPreview(URL.createObjectURL(files[0]))
      } catch (error) {
        toast.error('Failed to upload logo')
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleCoverUpload = async (files) => {
    if (files[0]) {
      setIsUploading(true)
      try {
        const result = await uploadFile(files[0], 'restaurant-covers')
        setCoverFile(result.url)
        setCoverPreview(URL.createObjectURL(files[0]))
      } catch (error) {
        toast.error('Failed to upload cover image')
      } finally {
        setIsUploading(false)
      }
    }
  }

  const onSubmit = (data) => {
    mutation.mutate({
      ...data,
      logoUrl: logoFile || logoPreview,
      coverImageUrl: coverFile || coverPreview,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Logo</label>
          <FileUpload onFileSelect={handleLogoUpload} accept={{ 'image/*': ['.jpeg', '.png', '.jpg'] }} />
          {logoPreview && <img src={logoPreview} alt="Logo" className="mt-2 w-24 h-24 object-cover rounded-lg" />}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
          <FileUpload onFileSelect={handleCoverUpload} accept={{ 'image/*': ['.jpeg', '.png', '.jpg'] }} />
          {coverPreview && <img src={coverPreview} alt="Cover" className="mt-2 w-full h-32 object-cover rounded-lg" />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Restaurant Name" {...register('name')} error={errors.name?.message} required />
        <Input label="Phone" {...register('phone')} error={errors.phone?.message} required />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} required />
        <Input label="Website" {...register('website')} error={errors.website?.message} />
      </div>

      <Textarea label="Description" {...register('description')} rows={3} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Address" {...register('address')} error={errors.address?.message} required />
        <Input label="City" {...register('city')} error={errors.city?.message} required />
        <Input label="State" {...register('state')} error={errors.state?.message} />
        <Input label="Postal Code" {...register('postalCode')} error={errors.postalCode?.message} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={mutation.isLoading || isUploading}>Save Changes</Button>
      </div>
    </form>
  )
}

export default RestaurantProfile