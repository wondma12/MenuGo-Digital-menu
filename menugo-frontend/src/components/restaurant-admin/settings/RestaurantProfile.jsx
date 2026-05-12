import React, { useState, useEffect } from 'react'
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

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
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
      logoUrl: settings?.logoUrl || settings?.logo || settings?.logo_url || '',
      coverImageUrl: settings?.coverImageUrl || settings?.coverImage || settings?.cover_image_url || '',
    },
  })

  const mutation = useMutation(updateRestaurantProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries('restaurantSettings')
      toast.success('Profile updated successfully')
    },
    onError: () => toast.error('Failed to update profile'),
  })

  const handleLogoUpload = async (filesOrFile) => {
    const file = Array.isArray(filesOrFile) ? filesOrFile[0] : filesOrFile
    if (file) {
      setIsUploading(true)
      try {
        const result = await uploadFile(file, 'restaurant-logos')
        setLogoFile(result.url)
        setLogoPreview(URL.createObjectURL(file))
        // Persist uploaded URL into the form field so it submits correctly
        setValue('logoUrl', result.url)
      } catch (error) {
        toast.error('Failed to upload logo')
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleCoverUpload = async (filesOrFile) => {
    const file = Array.isArray(filesOrFile) ? filesOrFile[0] : filesOrFile
    if (file) {
      setIsUploading(true)
      try {
        const result = await uploadFile(file, 'restaurant-covers')
        setCoverFile(result.url)
        setCoverPreview(URL.createObjectURL(file))
        // Persist uploaded URL into the form field so it submits correctly
        setValue('coverImageUrl', result.url)
      } catch (error) {
        toast.error('Failed to upload cover image')
      } finally {
        setIsUploading(false)
      }
    }
  }

  // Reflect manual URL inputs into previews when no uploaded file present
  const watchedLogoUrl = watch('logoUrl')
  const watchedCoverUrl = watch('coverImageUrl')

  useEffect(() => {
    if (!logoFile) {
      if (watchedLogoUrl) setLogoPreview(watchedLogoUrl)
      else setLogoPreview(null)
    }
  }, [watchedLogoUrl, logoFile])

  useEffect(() => {
    if (!coverFile) {
      if (watchedCoverUrl) setCoverPreview(watchedCoverUrl)
      else setCoverPreview(null)
    }
  }, [watchedCoverUrl, coverFile])

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
          {logoPreview ? (
            <div className="mt-2 flex items-center gap-3">
              <img src={logoPreview} alt="Logo" className="w-24 h-24 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  setLogoPreview(null)
                  setLogoFile(null)
                  setValue('logoUrl', '')
                }}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ) : null}

          <div className="mt-3">
            <Input label="Logo URL" {...register('logoUrl')} placeholder="https://example.com/logo.png" />
            <p className="text-xs text-gray-500 mt-1">If upload fails, paste the logo URL here.</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
          <FileUpload onFileSelect={handleCoverUpload} accept={{ 'image/*': ['.jpeg', '.png', '.jpg'] }} />
          {coverPreview ? (
            <div className="mt-2 relative">
              <img src={coverPreview} alt="Cover" className="w-full h-32 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  setCoverPreview(null)
                  setCoverFile(null)
                  setValue('coverImageUrl', '')
                }}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
              >
                Remove
              </button>
            </div>
          ) : null}

          <div className="mt-3">
            <Input label="Cover Image URL" {...register('coverImageUrl')} placeholder="https://example.com/cover.jpg" />
            <p className="text-xs text-gray-500 mt-1">If drag & drop doesn't work, paste the image URL here.</p>
          </div>
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