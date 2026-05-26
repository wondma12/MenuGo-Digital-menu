import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQuery } from 'react-query'
import {
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import Input from '../../../common/Input'
import Textarea from '../../../common/Textarea'
import Select from '../../../common/Select'
import Button from '../../../common/Button'
import FileUpload from '../../../common/FileUpload'
import Loading from '../../../common/Loading'
import Alert from '../../../common/Alert'
import { createRestaurant, updateRestaurant, getRestaurantDetails, uploadDocument } from '../../../services/restaurantService'
import toast from 'react-hot-toast'

const schema = yup.object({
  name: yup.string().required('Restaurant name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  country: yup.string().required('Country is required'),
  ownerName: yup.string().required('Owner full name is required'),
  ownerEmail: yup.string().email('Invalid owner email').required('Owner email is required'),
  businessLicenseNumber: yup.string().required('Business license number is required'),
  tinNumber: yup.string().required('TIN number is required'),
  googleMapsLink: yup.string().url('Invalid URL').required('Google Maps link is required'),
  description: yup.string().max(500, 'Description cannot exceed 500 characters'),
  cuisineType: yup.string(),
  subscriptionTier: yup.string().required('Subscription tier is required'),
})

const RestaurantForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id
  const [logoFile, setLogoFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [logoRawFile, setLogoRawFile] = useState(null)
  const [coverRawFile, setCoverRawFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [licenseFile, setLicenseFile] = useState(null)
  const [licensePreview, setLicensePreview] = useState(null)

  const { data: restaurant, isLoading: isLoadingRestaurant } = useQuery(
    ['restaurant', id],
    () => getRestaurantDetails(id),
    { enabled: isEditing }
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      subscriptionTier: 'basic',
    },
  })

  useEffect(() => {
    if (restaurant) {
      reset({
        name: restaurant.name,
        email: restaurant.email,
        phone: restaurant.phone,
        address: restaurant.address,
        city: restaurant.city,
        country: restaurant.country,
        description: restaurant.description,
        cuisineType: restaurant.cuisineType,
        subscriptionTier: restaurant.subscriptionTier,
      })
      // Normalize potential logo/cover keys from service
      const logoUrl = restaurant.logoUrl || restaurant.logo || restaurant.logo_url || restaurant.logoUrl || null
      const coverUrl = restaurant.coverImageUrl || restaurant.coverImage || restaurant.cover_image_url || restaurant.coverImageUrl || null
      setLogoPreview(logoUrl)
      setCoverPreview(coverUrl)

      // Set these values into the form so manual URLs persist
      setValue('logoUrl', logoUrl || '')
      setValue('coverImageUrl', coverUrl || '')

      // Owner / business fields
      setValue('ownerName', restaurant.owner_name || restaurant.ownerName || '')
      setValue('ownerEmail', restaurant.owner_email || restaurant.ownerEmail || '')
      setValue('ownerPhone', restaurant.owner_phone || restaurant.ownerPhone || '')
      setValue('subCity', restaurant.sub_city || restaurant.subCity || '')
      setValue('businessLicenseNumber', restaurant.business_license_number || restaurant.businessLicenseNumber || '')
      setValue('tinNumber', restaurant.tin_number || restaurant.tinNumber || '')
      setValue('slogan', restaurant.slogan || restaurant.restaurant_slogan || '')
      setValue('googleMapsLink', restaurant.google_maps_link || restaurant.googleMapsLink || restaurant.restaurant_website || '')
    }
  }, [restaurant, reset])

  // Set license preview from restaurant settings if available
  useEffect(() => {
    if (restaurant) {
      const license = restaurant.settings?.business_license || restaurant.business_license || null
      if (license && license.url) setLicensePreview(license.url)
      else if (restaurant.settings && restaurant.settings.business_license && typeof restaurant.settings.business_license === 'string') {
        // fallback: if stored as string URL
        setLicensePreview(restaurant.settings.business_license)
      }
    }
  }, [restaurant])

  // Watch manual URL fields and update previews when no uploaded file present
  const watchedLogoUrl = watch('logoUrl')
  const watchedCoverUrl = watch('coverImageUrl')

  useEffect(() => {
    // Only reflect manual URL into preview when there is no uploaded file
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

  const createMutation = useMutation(createRestaurant, {
    onSuccess: (res) => {
      const created = res?.data || res || {}
      const restaurantId = created.id || created.restaurant?.id
      toast.success('Restaurant created successfully')
      if (restaurantId) {
        navigate(`/platform/restaurants/${restaurantId}/edit`)
      } else {
        navigate('/platform/restaurants')
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create restaurant')
    },
  })

  const updateMutation = useMutation(updateRestaurant, {
    onSuccess: (res) => {
      const updated = res?.data || res || {}
      // If backend returned updated settings with business_license, show preview
      const license = (updated && (updated.settings?.business_license || updated.restaurant?.settings?.business_license))
      if (license && license.url) setLicensePreview(license.url)
      toast.success('Restaurant updated successfully')
      // Keep user on the page so they can see the uploaded license preview
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update restaurant')
    },
  })

  const handleLogoUpload = (file) => {
    if (file) {
      setLogoRawFile(file)
      // Show local preview; actual upload happens on form submit
      setLogoPreview(URL.createObjectURL(file))
      // clear any previously persisted uploaded URL
      setLogoFile(null)
    }
  }

  const handleCoverUpload = (file) => {
    if (file) {
      setCoverRawFile(file)
      // Show local preview; actual upload happens on form submit
      setCoverPreview(URL.createObjectURL(file))
      setCoverFile(null)
    }
  }

  const handleLicenseSelect = async (file) => {
    if (file) {
      // Keep the raw file and show its name as preview; actual upload happens on submit
      setLicenseFile(file)
      setLicensePreview(file.name || 'license_document')
    }
  }

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      logoUrl: logoFile || logoPreview,
      coverImageUrl: coverFile || coverPreview,
    }

    // Map owner/business fields to backend expected keys
    if (formData.ownerName) formData.owner_name = formData.ownerName
    if (formData.ownerEmail) formData.owner_email = formData.ownerEmail
    if (formData.ownerPhone) formData.owner_phone = formData.ownerPhone
    if (formData.businessLicenseNumber) formData.business_license_number = formData.businessLicenseNumber
    if (formData.tinNumber) formData.tin_number = formData.tinNumber
    if (formData.googleMapsLink) formData.restaurant_website = formData.googleMapsLink
    if (formData.slogan) formData.restaurant_slogan = formData.slogan

    try {
      if (licenseFile || logoRawFile || coverRawFile) {
        // Build multipart FormData including the license file and other fields
        const fd = new FormData()
        // Append top-level restaurant fields
        Object.keys(formData).forEach((key) => {
          const val = formData[key]
          if (val === null || typeof val === 'undefined') return
          // don't append nested objects like settings directly
          if (typeof val === 'object' && !(val instanceof File) && !(val instanceof Blob)) {
            fd.append(key, JSON.stringify(val))
          } else {
            fd.append(key, val)
          }
        })
        // Append license file under 'document' to match backend route
        if (licenseFile) fd.append('document', licenseFile)
        if (logoRawFile) fd.append('logo', logoRawFile)
        if (coverRawFile) fd.append('coverImage', coverRawFile)

        if (isEditing) {
          await updateMutation.mutateAsync({ id, data: fd })
        } else {
          await createMutation.mutateAsync(fd)
        }
      } else {
        // No file: continue with existing JSON flow
        if (isEditing) {
          await updateMutation.mutateAsync({ id, data: formData })
        } else {
          await createMutation.mutateAsync(formData)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (isEditing && isLoadingRestaurant) return <Loading />

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Restaurant' : 'Add New Restaurant'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEditing ? 'Update restaurant information' : 'Register a new restaurant on the platform'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo and Cover Images */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Branding</h3>
          
          {/* Cover Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
            <div className="relative">
              {coverPreview ? (
                <div className="relative">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverPreview(null)
                      setCoverFile(null)
                      setValue('coverImageUrl', '')
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <FileUpload
                  onFileSelect={handleCoverUpload}
                  accept={{ 'image/*': ['.jpeg', '.png', '.jpg', '.gif'] }}
                  label="Upload cover image"
                />
              )}
            </div>
            {/* Manual cover image URL (fallback if upload doesn't work) */}
            <div className="mt-3">
              <Input
                label="Cover Image URL"
                {...register('coverImageUrl')}
                placeholder="https://example.com/cover.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">If drag & drop doesn't work, paste the image URL here.</p>
            </div>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            <div className="flex items-start gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreview(null)
                      setLogoFile(null)
                      setValue('logoUrl', '')
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <FileUpload
                  onFileSelect={handleLogoUpload}
                  accept={{ 'image/*': ['.jpeg', '.png', '.jpg', '.svg'] }}
                  label="Upload logo"
                />
              )}
            </div>
            {/* Manual logo URL (fallback) */}
            <div className="mt-3 w-full md:w-1/2">
              <Input
                label="Logo URL"
                {...register('logoUrl')}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-gray-500 mt-1">If upload fails, paste the logo URL here.</p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Restaurant Name"
              {...register('name')}
              error={errors.name?.message}
              required
              icon={BuildingOfficeIcon}
            />
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              required
              icon={EnvelopeIcon}
            />
            <Input
              label="Phone"
              {...register('phone')}
              error={errors.phone?.message}
              required
              icon={PhoneIcon}
            />
            <Input
              label="Cuisine Type"
              {...register('cuisineType')}
              error={errors.cuisineType?.message}
              placeholder="e.g., Italian, Chinese, Fusion"
            />
          </div>
          <Textarea
            label="Description"
            {...register('description')}
            error={errors.description?.message}
            rows={4}
            placeholder="Describe the restaurant..."
          />
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPinIcon className="w-5 h-5" />
            Address Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Street Address"
                {...register('address')}
                error={errors.address?.message}
                required
              />
            </div>
            <Input
              label="City"
              {...register('city')}
              error={errors.city?.message}
              required
            />
            <Input
              label="Country"
              {...register('country')}
              error={errors.country?.message}
              required
            />
          </div>
        </div>

          {/* Owner & Business Information */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner & Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Owner Full Name"
                {...register('ownerName')}
                error={errors.ownerName?.message}
                required
              />
              <Input
                label="Owner Email"
                type="email"
                {...register('ownerEmail')}
                error={errors.ownerEmail?.message}
                required
              />
              <Input
                label="Owner Phone"
                {...register('ownerPhone')}
                error={errors.ownerPhone?.message}
              />
              <Input
                label="Sub-city / District"
                {...register('subCity')}
                error={errors.subCity?.message}
              />
              <Input
                label="Google Maps Link"
                {...register('googleMapsLink')}
                error={errors.googleMapsLink?.message}
                placeholder="https://maps.google.com/..."
              />
              <Input
                label="Slogan"
                {...register('slogan')}
                error={errors.slogan?.message}
              />
              <Input
                label="Business License Number"
                {...register('businessLicenseNumber')}
                error={errors.businessLicenseNumber?.message}
                required
              />
              <Input
                label="TIN Number"
                {...register('tinNumber')}
                error={errors.tinNumber?.message}
                required
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Business License Document</label>
              {licensePreview ? (
                <div className="flex items-center gap-4">
                  {/https?:\/\//i.test(licensePreview) ? (
                    <a href={licensePreview} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm">
                      View / Download document
                    </a>
                  ) : (
                    <div className="text-sm text-gray-700">{licensePreview}</div>
                  )}
                  <button
                    type="button"
                    onClick={() => { setLicenseFile(null); setLicensePreview(null); }}
                    className="px-2 py-1 text-sm bg-red-600 text-white rounded"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <FileUpload
                  onFileSelect={handleLicenseSelect}
                  accept={{ '*': ['.pdf', '.doc', '.docx', '.png', '.jpg'] }}
                  label="Upload business license (PDF or image)"
                />
              )}
              <p className="text-xs text-gray-500 mt-2">Upload the official business license document for verification.</p>
            </div>
          </div>

        {/* Subscription Information */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Plan</h3>
          <Select
            label="Subscription Tier"
            {...register('subscriptionTier')}
            error={errors.subscriptionTier?.message}
            options={[
              { value: 'basic', label: 'Basic - $29/month' },
              { value: 'premium', label: 'Premium - $79/month' },
              { value: 'enterprise', label: 'Enterprise - $199/month' },
            ]}
            required
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/platform/restaurants')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={createMutation.isLoading || updateMutation.isLoading || isUploading}
          >
            {isEditing ? 'Update Restaurant' : 'Create Restaurant'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default RestaurantForm