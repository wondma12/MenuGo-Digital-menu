// src/components/platform-admin/restaurants/RestaurantDetails.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { getRestaurantDetails } from '../../../services/restaurantService';
import Loading from '../../common/Loading';
import Skeleton from '../../common/Skeleton';
import Alert from '../../common/Alert';
import Modal from '../../../common/Modal'
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon,
  StarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery(
    ['restaurant', id],
    () => getRestaurantDetails(id),
    {
      retry: 1,
      retryDelay: 1000,
      enabled: !!id,
    }
  );

  const [showPreview, setShowPreview] = useState(false)
  const [previewSrc, setPreviewSrc] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState(null)

  const handleDocumentPreview = async (href) => {
    if (!href) return
    const proxyUrl = `/api/preview?url=${encodeURIComponent(href)}`
    setPreviewError(null)
    setPreviewLoading(true)

    try {
      const headResponse = await fetch(proxyUrl, { method: 'HEAD' })
      if (headResponse.ok) {
        const contentType = headResponse.headers.get('content-type') || ''
        setPreviewSrc({ url: proxyUrl, contentType })
        setShowPreview(true)
        return
      }

      // Some providers reject HEAD requests even though GET works.
      const getResponse = await fetch(proxyUrl, { method: 'GET' })
      if (!getResponse.ok) {
        throw new Error('Preview resource is not available')
      }
      const contentType = getResponse.headers.get('content-type') || ''
      if (getResponse.body && typeof getResponse.body.cancel === 'function') {
        getResponse.body.cancel()
      }
      setPreviewSrc({ url: proxyUrl, contentType })
      setShowPreview(true)
    } catch (err) {
      console.warn('Preview check failed, falling back to direct URL:', err)
      setPreviewError('Preview not available due to cross-origin restrictions or network error. You can download the document.')
      setPreviewSrc({ url: href, contentType: '' })
      setShowPreview(true)
    } finally {
      setPreviewLoading(false)
    }
  }

  // Extract restaurant data from response (handle multiple possible formats)
  const restaurant = data?.data?.data || data?.data || data;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
          <div className="flex gap-6 mb-8">
            <div className="w-32 h-32 bg-gray-200 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          type="error"
          title="Error Loading Restaurant"
          message={error?.response?.data?.message || error?.message || 'Failed to load restaurant details'}
          onRetry={() => refetch()}
          onBack={() => navigate('/platform/restaurants')}
        />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-6">
        <Alert
          type="warning"
          title="Restaurant Not Found"
          message="The restaurant you're looking for doesn't exist or has been removed."
          onBack={() => navigate('/platform/restaurants')}
        />
      </div>
    );
  }

  // Safe navigation with fallbacks
  const coverImage = restaurant?.cover_image_url || restaurant?.coverImageUrl || '/placeholder-food.jpg';
  const logo = restaurant?.logo_url || restaurant?.logoUrl || '/logo.svg';
  const name = restaurant?.name || 'Restaurant Name';
  const description = restaurant?.description || restaurant?.slogan || restaurant?.restaurant_slogan || 'No description available';
  const address = restaurant?.address || '';
  const city = restaurant?.city || '';
  const state = restaurant?.state || '';
  const country = restaurant?.country || '';
  const phone = restaurant?.phone || '';
  const whatsapp = restaurant?.whatsapp_number || restaurant?.whatsapp || '';
  const email = restaurant?.email || '';
  const website = restaurant?.website || null;
  const cuisineType = restaurant?.cuisine_type || 'Various';
  // Coerce possible string/null values into a number for safe formatting
  const averageRating = Number(restaurant?.average_rating ?? restaurant?.avg_rating ?? restaurant?.rating ?? 0);
  const totalReviews = restaurant?.total_reviews || 0;
  const totalMenuItems = restaurant?.total_menu_items || restaurant?.menu_items?.length || 0;
  const totalStaff = restaurant?.staff?.length || 0;
  const isActive = restaurant?.is_active ?? true;
  const isVerified = restaurant?.is_verified ?? false;

  // Format full address
  const fullAddress = [address, city, state, country].filter(Boolean).join(', ');

  // Get owner info
  const owner = restaurant?.restaurant_owner || restaurant?.owner || {};
  const ownerFullName = restaurant?.owner_name || owner?.full_name || owner?.fullName || '';
  const ownerEmail = owner?.email || restaurant?.email || '';
  const ownerPhone = owner?.phone || restaurant?.phone || '';
  const parsedSettings = (() => {
    const rawSettings = restaurant?.settings;
    if (!rawSettings) return {};
    if (typeof rawSettings === 'string') {
      try {
        const parsed = require('../../../utils/helpers').safeParseJSON(rawSettings)
        return parsed || {}
      } catch (error) {
        return {}
      }
    }
    return rawSettings;
  })();

  const subCity = (
    restaurant?.sub_city ||
    restaurant?.subCity ||
    restaurant?.restaurant_sub_city ||
    restaurant?.restaurantSubCity ||
    parsedSettings?.sub_city ||
    parsedSettings?.subCity ||
    restaurant?.address_details?.sub_city ||
    restaurant?.address_details?.subCity ||
    restaurant?.data?.sub_city ||
    restaurant?.data?.subCity ||
    ''
  );
  const googleMaps = restaurant?.website || restaurant?.google_maps || '';
  const businessLicenseNumber = (
    restaurant?.business_license_number ||
    restaurant?.businessLicenseNumber ||
    parsedSettings?.business_license?.number ||
    parsedSettings?.business_license?.businessLicenseNumber ||
    parsedSettings?.business_license_number ||
    parsedSettings?.businessLicenseNumber ||
    restaurant?.data?.business_license_number ||
    restaurant?.data?.businessLicenseNumber ||
    ''
  );
  const tinNumber = (
    restaurant?.tin_number ||
    restaurant?.tinNumber ||
    parsedSettings?.tin_number ||
    parsedSettings?.tinNumber ||
    parsedSettings?.business_license?.tin_number ||
    parsedSettings?.business_license?.tinNumber ||
    restaurant?.data?.tin_number ||
    restaurant?.data?.tinNumber ||
    ''
  );
  const businessLicenseDoc = (
    parsedSettings?.business_license?.url ||
    parsedSettings?.business_license?.fileUrl ||
    parsedSettings?.business_license?.file_url ||
    parsedSettings?.business_license?.document_url ||
    parsedSettings?.business_license?.documentUrl ||
    parsedSettings?.business_license?.path ||
    parsedSettings?.business_license_url ||
    parsedSettings?.businessLicenseUrl ||
    restaurant?.business_license_url ||
    restaurant?.businessLicenseUrl ||
    restaurant?.business_license?.url ||
    restaurant?.document_url ||
    restaurant?.documentUrl ||
    restaurant?.settings?.business_license?.url ||
    restaurant?.settings?.business_license_url ||
    restaurant?.settings?.businessLicenseUrl ||
    restaurant?.data?.business_license_url ||
    restaurant?.data?.businessLicenseUrl ||
    null
  );

  const resolveDocumentHref = (value) => {
    if (typeof value !== 'string') return null;
    const normalizedValue = value.trim();
    if (!normalizedValue) return null;
    if (normalizedValue.startsWith('http://') || normalizedValue.startsWith('https://')) return normalizedValue;
    if (normalizedValue.startsWith('/')) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      return origin ? `${origin}${normalizedValue}` : normalizedValue;
    }
    return normalizedValue;
  };

  const businessLicenseHref = resolveDocumentHref(businessLicenseDoc);
  const hasBusinessLicenseInfo = Boolean(businessLicenseNumber || tinNumber || businessLicenseHref);
  

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero Section with Cover Image */}
      <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6 bg-gray-200">
        <img
          src={coverImage}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/placeholder-food.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Status Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isVerified && (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <CheckCircleIcon className="w-4 h-4" />
              Verified
            </span>
          )}
          {!isActive && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <XCircleIcon className="w-4 h-4" />
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Restaurant Info Section */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src={logo}
            alt={name}
            className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-lg bg-white"
            onError={(e) => {
              e.target.src = '/logo.svg';
            }}
          />
        </div>

        {/* Main Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
          <p className="text-gray-600 mb-4">{description}</p>
          
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Rating */}
            {Number.isFinite(averageRating) && averageRating > 0 && (
              <div className="flex items-center gap-1">
                <StarIcon className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">{averageRating.toFixed(1)}</span>
                <span className="text-gray-500">({totalReviews} reviews)</span>
              </div>
            )}
            
            {/* Cuisine */}
            <div className="flex items-center gap-1">
              <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
              <span>{cuisineType}</span>
            </div>
            
            {/* Stats */}
            {totalMenuItems > 0 && (
              <div className="flex items-center gap-1">
                <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                <span>{totalMenuItems} menu items</span>
              </div>
            )}
            
            {totalStaff > 0 && (
              <div className="flex items-center gap-1">
                <UsersIcon className="w-5 h-5 text-gray-400" />
                <span>{totalStaff} staff members</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
            <BuildingOfficeIcon className="w-5 h-5 text-primary-600" />
            Contact Information
          </h2>
          <div className="space-y-3">
            {fullAddress && (
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-gray-600">{fullAddress}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-gray-400" />
                <a href={`tel:${phone}`} className="text-gray-600 hover:text-primary-600">
                  {phone}
                </a>
              </div>
            )}
            {whatsapp && (
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-gray-400" />
                <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary-600">
                  WhatsApp: {whatsapp}
                </a>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                <a href={`mailto:${email}`} className="text-gray-600 hover:text-primary-600">
                  {email}
                </a>
              </div>
            )}
            {website && (
              <div className="flex items-center gap-3">
                <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                <a href={website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary-600">
                  {website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
            <ClockIcon className="w-5 h-5 text-primary-600" />
            Business Hours
          </h2>
          {restaurant?.operating_hours && Object.keys(restaurant.operating_hours).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(restaurant.operating_hours).map(([day, hours]) => (
                <div key={day} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                  <span className="capitalize font-medium text-gray-700">{day}</span>
                  <span className="text-gray-500">
                    {hours?.is_closed ? 'Closed' : `${hours?.open || '--'} - ${hours?.close || '--'}`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Hours not specified</p>
          )}
        </div>
      </div>

      {/* Owner Information */}
      {(
        ownerFullName || ownerEmail || ownerPhone || subCity || hasBusinessLicenseInfo
      ) && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
            <UsersIcon className="w-5 h-5 text-primary-600" />
            Owner & Business Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Owner Full Name</p>
              <p className="font-medium text-gray-900">{ownerFullName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Owner Email</p>
              <p className="font-medium text-gray-900">{ownerEmail || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Owner Phone</p>
              <p className="font-medium text-gray-900">{ownerPhone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sub-city / District</p>
              <p className="font-medium text-gray-900">{subCity || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Business License Number</p>
              <p className="font-medium text-gray-900">{businessLicenseNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">TIN Number</p>
              <p className="font-medium text-gray-900">{tinNumber || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Business License Document</p>
              {businessLicenseHref ? (
                    <div className="flex flex-wrap gap-4 mt-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDocumentPreview(businessLicenseHref)
                        }}
                        className="text-primary-600 hover:underline"
                      >
                        View document
                      </button>
                      <a href={businessLicenseHref} target="_blank" rel="noopener noreferrer" download className="text-primary-600 hover:underline">
                        Download document
                      </a>
                    </div>
              ) : (
                <p className="font-medium text-gray-700">No file uploaded</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => navigate(`/platform/restaurants/${id}/edit`)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Edit Restaurant
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Go Back
        </button>
      </div>
      {/* Document Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Business License Preview"
        size="lg"
      >
        {businessLicenseHref && (
          <div className="space-y-4">
            {previewLoading ? (
              <div className="p-8 text-center text-gray-500">Loading preview...</div>
            ) : previewError ? (
              <div className="p-4 bg-yellow-50 rounded">
                <p className="text-sm text-yellow-700">{previewError}</p>
              </div>
            ) : previewSrc ? (
              previewSrc.contentType.match(/image\//i) ? (
                <img src={previewSrc.url} alt="Business License" className="w-full rounded-lg" />
              ) : (
                <iframe src={previewSrc.url} className="w-full h-[600px] rounded-lg" title="Business License Preview" />
              )
            ) : (
              // fallback
              businessLicenseHref.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img src={businessLicenseHref} alt="Business License" className="w-full rounded-lg" />
              ) : (
                <iframe src={businessLicenseHref} className="w-full h-[600px] rounded-lg" title="Business License Preview" />
              )
            )}
            <div className="flex justify-end gap-3">
              <a href={businessLicenseHref} download target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Download
              </a>
              <button onClick={() => {
                setShowPreview(false)
                // revoke object URL if we created one
                try {
                  if (previewSrc && previewSrc.url && previewSrc.url.startsWith('blob:')) URL.revokeObjectURL(previewSrc.url)
                } catch (e) { /* ignore */ }
                setPreviewSrc(null)
                setPreviewError(null)
              }} className="px-4 py-2 bg-gray-100 rounded-lg">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

RestaurantDetails.displayName = 'RestaurantDetails'

export default RestaurantDetails;