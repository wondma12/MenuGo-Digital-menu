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
  const [businessLicenseFile, setBusinessLicenseFile] = useState(null)
  const [businessLicensePreview, setBusinessLicensePreview] = useState(settings?.business_license_url || settings?.settings?.business_license?.url || null)
  const [logoUploadKey, setLogoUploadKey] = useState(0)
  const [coverUploadKey, setCoverUploadKey] = useState(0)
  const [businessLicenseUploadKey, setBusinessLicenseUploadKey] = useState(0)
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
      ownerFullName: settings?.owner_full_name || settings?.settings?.owner_full_name || settings?.owner?.full_name || '',
      ownerEmail: settings?.owner_email || settings?.settings?.owner_email || settings?.owner?.email || '',
      ownerPhone: settings?.owner_phone || settings?.settings?.owner_phone || settings?.owner?.phone || '',
      district: settings?.district || settings?.settings?.district || '',
      googleMapsLink: settings?.google_maps_link || settings?.settings?.google_maps_link || settings?.googleMapsLink || '',
      // slogan removed (same as description)
      businessLicenseNumber: settings?.business_license_number || settings?.settings?.business_license?.number || '',
      tinNumber: settings?.tin_number || settings?.settings?.tin_number || '',
      businessLicenseUrl: settings?.business_license_url || settings?.settings?.business_license?.url || '',
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
        setLogoUploadKey((prev) => prev + 1)
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
        setCoverUploadKey((prev) => prev + 1)
      } catch (error) {
        toast.error('Failed to upload cover image')
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleBusinessLicenseUpload = async (filesOrFile) => {
    const file = Array.isArray(filesOrFile) ? filesOrFile[0] : filesOrFile
    if (file) {
      setIsUploading(true)
      try {
        const result = await uploadFile(file, 'business-licenses')
        setBusinessLicenseFile(result.url)
        setBusinessLicensePreview(URL.createObjectURL(file))
        // Persist uploaded URL into the form field so it submits correctly
        setValue('businessLicenseUrl', result.url)
        setBusinessLicenseUploadKey((prev) => prev + 1)
      } catch (error) {
        toast.error('Failed to upload business license document')
      } finally {
        setIsUploading(false)
      }
    }
  }

  // Reflect manual URL inputs into previews when no uploaded file present
  const watchedLogoUrl = watch('logoUrl')
  const watchedCoverUrl = watch('coverImageUrl')
  const watchedBusinessLicenseUrl = watch('businessLicenseUrl')

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

  useEffect(() => {
    if (!businessLicenseFile) {
      if (watchedBusinessLicenseUrl) setBusinessLicensePreview(watchedBusinessLicenseUrl)
      else setBusinessLicensePreview(null)
    }
  }, [watchedBusinessLicenseUrl, businessLicenseFile])

  const onSubmit = (data) => {
    // Build settings object merging existing settings with new profile fields
    const existingSettings = settings?.settings || {}

    const settingsPayload = {
      ...existingSettings,
      owner_full_name: data.ownerFullName,
      owner_email: data.ownerEmail,
      owner_phone: data.ownerPhone,
      district: data.district,
      google_maps_link: data.googleMapsLink,
      tin_number: data.tinNumber,
      business_license_number: data.businessLicenseNumber,
      business_license: {
        ...(existingSettings.business_license || {}),
        url: businessLicenseFile || data.businessLicenseUrl || (existingSettings.business_license && existingSettings.business_license.url) || '',
        number: data.businessLicenseNumber || (existingSettings.business_license && existingSettings.business_license.number) || '',
      },
    }

    // Exclude slogan from submitted payload since it's redundant with description
    const { slogan: _slogan, ...rest } = data

    const payload = {
      ...rest,
      logoUrl: logoFile || logoPreview,
      coverImageUrl: coverFile || coverPreview,
      settings: settingsPayload,
    }

    mutation.mutate(payload)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Restaurant Logo</label>
          <FileUpload clearFilesKey={logoUploadKey} onFileSelect={handleLogoUpload} accept={{ 'image/*': ['.jpeg', '.png', '.jpg'] }} />
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
              <p className="text-xs text-slate-500 mt-1">If upload fails, paste the logo URL here.</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Cover Image</label>
          <FileUpload clearFilesKey={coverUploadKey} onFileSelect={handleCoverUpload} accept={{ 'image/*': ['.jpeg', '.png', '.jpg'] }} />
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
              <p className="text-xs text-slate-500 mt-1">If drag & drop doesn't work, paste the image URL here.</p>
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

      <div className="mt-6">
        <h2 className="text-lg font-medium text-slate-900 mb-3">Owner & Business Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Owner Full Name" {...register('ownerFullName')} />
          <Input label="Owner Email" type="email" {...register('ownerEmail')} />
          <Input label="Owner Phone" {...register('ownerPhone')} />
          <Input label="Sub-city / District" {...register('district')} />
          <Input label="Google Maps Link" {...register('googleMapsLink')} />
          
          <Input label="Business License Number" {...register('businessLicenseNumber')} />
          <Input label="TIN Number" {...register('tinNumber')} />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Business License Document</label>
          <FileUpload clearFilesKey={businessLicenseUploadKey} onFileSelect={handleBusinessLicenseUpload} accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.jpeg', '.png', '.jpg'] }} />
          {businessLicensePreview ? (
            <div className="mt-2 flex items-center gap-3">
                <a href={businessLicenseFile || watch('businessLicenseUrl')} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-600 hover:underline">View / Download document</a>
              <button
                type="button"
                onClick={() => {
                  setBusinessLicensePreview(null)
                  setBusinessLicenseFile(null)
                  setValue('businessLicenseUrl', '')
                }}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ) : null}
          <p className="text-xs text-slate-500 mt-1">Accepted: PDF or image. If upload fails, paste the document URL below.</p>
          <div className="mt-3">
            <Input label="Business License URL" {...register('businessLicenseUrl')} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={mutation.isLoading || isUploading} className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-orange-600">Save Changes</Button>
      </div>
    </form>
  )
}

export default RestaurantProfile