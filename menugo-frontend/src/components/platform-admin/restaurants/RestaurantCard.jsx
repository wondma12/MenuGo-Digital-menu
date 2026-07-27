import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline'
import { updateRestaurantStatus, deleteRestaurant, verifyRestaurant } from '../../../services/restaurantService'
import ConfirmationDialog from '../../common/ConfirmationDialog'
import Dropdown from '../../common/Dropdown'

const RestaurantCard = ({ restaurant, onUpdate, variant = 'grid' }) => {
  const navigate = useNavigate()
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isListView = variant === 'list'

  const [timeLeft, setTimeLeft] = useState(null)

  const subscriptionEndDate = useMemo(() => {
    if (!restaurant.subscription_end_date) return null
    const parsed = new Date(restaurant.subscription_end_date)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }, [restaurant.subscription_end_date])

  const shouldShowCountdown = Boolean(restaurant.is_verified && subscriptionEndDate)

  useEffect(() => {
    if (!shouldShowCountdown) {
      setTimeLeft(null)
      return
    }

    const updateCountdown = () => {
      const difference = subscriptionEndDate.getTime() - Date.now()
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / (1000 * 60)) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      setTimeLeft({ days, hours, minutes, seconds, expired: false })
    }

    updateCountdown()
    const timer = window.setInterval(updateCountdown, 1000)
    return () => window.clearInterval(timer)
  }, [shouldShowCountdown, subscriptionEndDate])

  const statusBadge = !restaurant.is_active
    ? { label: 'Inactive', color: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100', icon: XCircleIcon }
    : !restaurant.is_verified
      ? { label: 'Pending Verification', color: 'bg-[rgb(254,243,199)] text-[rgb(217,119,6)] ring-1 ring-[rgb(253,230,138)]', icon: ClockIcon }
      : { label: 'Active', color: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100', icon: CheckCircleIcon }

  const tierBadge = {
    monthly: { label: 'Monthly', color: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' },
    six_month: { label: '6-Month', color: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' },
    yearly: { label: 'Yearly', color: 'bg-orange-50 text-orange-700 ring-1 ring-orange-100' },
  }[restaurant.subscription_tier] || { label: 'Monthly', color: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' }

  const hasPendingUpgradeRequest = (restaurant.pending_upgrade_request_count || 0) > 0

  const StatusIcon = statusBadge.icon
  const logoSrc = restaurant.logo_url || restaurant.logo || restaurant.logoUrl || '/logo.svg'
  const coverStyle = restaurant.cover_image_url
    ? {
        backgroundImage: `linear-gradient(90deg, rgba(15,23,42,0.12), rgba(15,23,42,0.02)), url(${restaurant.cover_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {}

  const handleStatusToggle = async () => {
    setIsLoading(true)
    try {
      await updateRestaurantStatus(restaurant.id, !restaurant.is_active)
      toast.success(`Restaurant ${!restaurant.is_active ? 'activated' : 'deactivated'} successfully`)
      onUpdate?.()
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setIsLoading(false)
      setShowStatusDialog(false)
    }
  }

  const handleVerify = async () => {
    setIsLoading(true)
    try {
      await verifyRestaurant(restaurant.id, true)
      toast.success('Restaurant verified successfully')
      onUpdate?.()
    } catch (error) {
      toast.error('Failed to verify restaurant')
    } finally {
      setIsLoading(false)
      setShowVerifyDialog(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteRestaurant(restaurant.id)
      toast.success('Restaurant deleted successfully')
      onUpdate?.()
    } catch (error) {
      const serverMessage = error?.response?.data?.message || error?.message || 'Failed to delete restaurant'
      console.error('Delete restaurant error:', error)
      toast.error(serverMessage)
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  // Compute a robust menu items count using multiple possible backend keys
  const computedMenuItems =
    restaurant?.total_menu_items ??
    restaurant?.totalMenuItems ??
    (Array.isArray(restaurant?.menu_items) ? restaurant.menu_items.length : undefined) ??
    restaurant?.menu_count ??
    restaurant?.menuCount ??
    restaurant?.stats?.total_menu_items ??
    0

  const buildActions = () => [
    {
      label: 'View Details',
      icon: EyeIcon,
      onClick: () => navigate(`/platform/restaurants/${restaurant.id}`),
    },
    {
      label: 'Edit Restaurant',
      icon: PencilIcon,
      onClick: () => navigate(`/platform/restaurants/${restaurant.id}/edit`),
    },
    {
      label: !restaurant.is_active ? 'Activate' : 'Deactivate',
      icon: !restaurant.is_active ? CheckCircleIcon : XCircleIcon,
      onClick: () => setShowStatusDialog(true),
    },
    {
      label: 'Verify',
      icon: ShieldCheckIcon,
      onClick: () => setShowVerifyDialog(true),
      danger: false,
      hidden: !restaurant.is_active || restaurant.is_verified,
    },
    {
      label: 'Delete',
      icon: TrashIcon,
      onClick: () => setShowDeleteDialog(true),
      danger: true,
    },
  ].filter((item) => !item.hidden)

  const ActionMenu = () => (
    <Dropdown
      trigger={(
        <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600">
          <EllipsisVerticalIcon className="h-4 w-4" />
        </button>
      )}
      items={buildActions()}
      align="right"
      menuLayout="horizontal"
      menuDir="auto"
      className="rounded-none"
    />
  )

  const ListView = () => (
    <div className="group bg-white transition-colors hover:bg-slate-50/80">
      <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] lg:items-center lg:px-5">
        <div className="flex min-w-0 items-start gap-4">
          <img
            src={logoSrc}
            alt={restaurant.name}
            className="h-14 w-14 shrink-0 rounded-2xl border border-slate-200 bg-white object-cover shadow-sm"
            onError={(event) => {
              event.currentTarget.src = '/logo.svg'
            }}
          />
          <div className="min-w-0 flex-1">
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 group-hover:text-orange-600">
                {restaurant.name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tierBadge.color}`}>
                  {tierBadge.label}
                </span>
                {hasPendingUpgradeRequest && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-100">
                    Pending Upgrade
                  </span>
                )}
                {shouldShowCountdown && timeLeft && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    timeLeft.expired
                      ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                      : timeLeft.days <= 7
                      ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
                      : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                  }`}>
                    {timeLeft.expired ? 'Expired' : `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s left`}
                  </span>
                )}
              </div>
            </div>
            {/* Description and address removed from list view per UI request */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              {restaurant.cuisine_type && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-100">
                  <BuildingStorefrontIcon className="h-3.5 w-3.5 text-blue-500" />
                  {restaurant.cuisine_type}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          {restaurant.email && (
            <div className="flex items-center gap-2 truncate">
              <EnvelopeIcon className="h-4 w-4 text-orange-500" />
              <span className="truncate">{restaurant.email}</span>
            </div>
          )}
          {restaurant.owner && (
            <div className="text-xs text-slate-500">
              Owner: <span className="font-semibold text-slate-700">{restaurant.owner.full_name}</span>
            </div>
          )}
        </div>

        <div className=" text-center text-sm">
          <div className="text-xs text-slate-500">
            <p className="text-lg font-black text-slate-900">{computedMenuItems || 0}</p>
            <p className="text-[11px] text-slate-500">Menu Items</p>
          </div>
          {/* <div className="rounded-none bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
            <p className="text-lg font-black text-slate-900">{restaurant.total_orders || 0}</p>
            <p className="text-[11px] text-slate-500">Orders</p>
          </div>
          <div className="rounded-none bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
            <p className="text-lg font-black text-slate-900">{restaurant.average_rating || 0}</p>
            <p className="text-[11px] text-slate-500">Rating</p>
          </div> */}
        </div>

        <div className="text-sm text-slate-600 flex items-center justify-center">
          <div className={`flex items-center gap-1 text-sm font-semibold ${restaurant.is_active ? 'text-emerald-600' : (!restaurant.is_verified ? 'text-amber-600' : 'text-rose-600')}`}>
            <StatusIcon className="h-3 w-3" />
            {statusBadge.label}
          </div>
        </div>

        <div className="flex justify-end items-center space-x-1 pr-0">
          <button
            onClick={() => navigate(`/platform/restaurants/${restaurant.id}`)}
            title="View"
            className="rounded-none p-1 text-slate-500 hover:text-orange-600"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate(`/platform/restaurants/${restaurant.id}/edit`)}
            title="Edit"
            className="rounded-none p-1 text-slate-500 hover:text-orange-600"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowStatusDialog(true)}
            title={restaurant.is_active ? 'Deactivate' : 'Activate'}
            className={`rounded-none p-1 ${restaurant.is_active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
          >
            {restaurant.is_active ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
          </button>
          {(!restaurant.is_verified && restaurant.is_active) && (
            <button
              onClick={() => setShowVerifyDialog(true)}
              title="Verify"
              className="rounded-none p-1 text-emerald-700 hover:bg-emerald-50"
            >
              <ShieldCheckIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setShowDeleteDialog(true)}
            title="Delete"
            className="rounded-none p-1 text-slate-500 hover:text-rose-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  const CardView = () => (
    <div className="overflow-hidden rounded-none border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl">
      <div
        className={`relative h-28 sm:h-32 ${!restaurant.cover_image_url ? 'bg-gradient-to-r from-orange-600 to-orange-500' : ''}`}
        style={coverStyle}
      >
        <div className="absolute -bottom-7 left-4">
          <img
            src={logoSrc}
            alt={restaurant.name}
            className="h-12 w-12 rounded-none border-4 border-white bg-white object-cover sm:h-16 sm:w-16"
            onError={(event) => {
              event.currentTarget.src = '/logo.svg'
            }}
          />
        </div>
        <div className="absolute right-3 top-3 flex gap-2 items-center flex-wrap justify-end">
          <div className={`flex items-center gap-1 text-xs font-semibold ${restaurant.is_active ? 'text-emerald-600' : (!restaurant.is_verified ? 'text-amber-600' : 'text-rose-600')}`}>
            <StatusIcon className="h-3 w-3" />
            {statusBadge.label}
          </div>
          <div className={`text-xs font-semibold px-2 py-1 rounded-full ${tierBadge.color}`}>
            {tierBadge.label}
          </div>
          {shouldShowCountdown && timeLeft && (
            <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
              timeLeft.expired
                ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                : timeLeft.days <= 7
                ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
                : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
            }`}>
              {timeLeft.expired ? 'Expired' : `${timeLeft.days}d ${timeLeft.hours}h`}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 pt-10">
        <h3 className="mb-1 text-lg font-black tracking-tight text-slate-900">{restaurant.name}</h3>
        <p className="mb-3 line-clamp-2 text-sm text-slate-500">{restaurant.description || 'No description'}</p>

        <div className="mb-4 space-y-2 break-words">
          {restaurant.address && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPinIcon className="h-4 w-4 text-orange-400" />
              <span className="truncate">{restaurant.address}, {restaurant.city}</span>
            </div>
          )}
          {restaurant.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <PhoneIcon className="h-4 w-4 text-blue-400" />
              <span>{restaurant.phone}</span>
            </div>
          )}
          {restaurant.email && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <EnvelopeIcon className="h-4 w-4 text-orange-400" />
              <span className="truncate">{restaurant.email}</span>
            </div>
          )}
          {restaurant.cuisine_type && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <BuildingStorefrontIcon className="h-4 w-4 text-blue-400" />
              <span>{restaurant.cuisine_type}</span>
            </div>
          )}
        </div>

        {restaurant.owner && (
          <div className="mb-3 border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-500">Owner</p>
            <p className="text-sm font-semibold text-slate-900">{restaurant.owner.full_name}</p>
            <p className="text-xs text-slate-500">{restaurant.owner.email}</p>
          </div>
        )}

        <div className="mb-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-2">
          <div className="text-center">
            <p className="text-lg font-black text-slate-900">{computedMenuItems || 0}</p>
            <p className="text-xs text-slate-500">Menu Items</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-slate-900">{restaurant.total_orders || 0}</p>
            <p className="text-xs text-slate-500">Orders</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-slate-900">{restaurant.average_rating || 0}</p>
            <p className="text-xs text-slate-500">Rating</p>
          </div>
        </div>

        <div className="flex gap-1 justify-end">
          <button
            onClick={() => navigate(`/platform/restaurants/${restaurant.id}`)}
            title="View"
            className="rounded-none p-2 text-slate-700 hover:text-orange-600"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate(`/platform/restaurants/${restaurant.id}/edit`)}
            title="Edit"
            className="rounded-none p-2 text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-2 flex gap-1 justify-end">
          {(!restaurant.is_verified && restaurant.is_active) && (
            <button
              onClick={() => setShowVerifyDialog(true)}
              title="Verify"
              className="rounded-none p-2 text-emerald-700 hover:bg-emerald-50"
            >
              <ShieldCheckIcon className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => setShowStatusDialog(true)}
            title={restaurant.is_active ? 'Deactivate' : 'Activate'}
            className={`rounded-none p-2 ${restaurant.is_active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
          >
            {restaurant.is_active ? <XCircleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            title="Delete"
            className="rounded-none p-2 text-slate-700 hover:text-rose-600"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {isListView ? <ListView /> : <CardView />}

      <ConfirmationDialog
        isOpen={showStatusDialog}
        title={restaurant.is_active ? 'Deactivate Restaurant' : 'Activate Restaurant'}
        message={`Are you sure you want to ${restaurant.is_active ? 'deactivate' : 'activate'} ${restaurant.name}?`}
        confirmLabel={restaurant.is_active ? 'Deactivate' : 'Activate'}
        confirmColor={restaurant.is_active ? 'red' : 'green'}
        onConfirm={handleStatusToggle}
        onClose={() => setShowStatusDialog(false)}
        isLoading={isLoading}
      />

      <ConfirmationDialog
        isOpen={showVerifyDialog}
        title="Verify Restaurant"
        message={`Are you sure you want to verify ${restaurant.name}? This will allow the restaurant to go live.`}
        confirmLabel="Verify"
        confirmColor="green"
        onConfirm={handleVerify}
        onClose={() => setShowVerifyDialog(false)}
        isLoading={isLoading}
      />

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Restaurant"
        message={`Are you sure you want to delete ${restaurant.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={handleDelete}
        onClose={() => setShowDeleteDialog(false)}
        isLoading={isLoading}
      />
    </>
  )
}

export default RestaurantCard
