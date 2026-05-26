// src/components/platform-admin/restaurants/RestaurantCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
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
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { updateRestaurantStatus, deleteRestaurant, verifyRestaurant } from '../../../services/restaurantService';
import ConfirmationDialog from '../../common/ConfirmationDialog';

const RestaurantCard = ({ restaurant, onUpdate }) => {
  const navigate = useNavigate();
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getStatusBadge = () => {
    if (!restaurant.is_active) {
      return { label: 'Inactive', color: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100', icon: XCircleIcon };
    }
    if (!restaurant.is_verified) {
      return { label: 'Pending Verification', color: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100', icon: ClockIcon };
    }
    return { label: 'Active', color: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100', icon: CheckCircleIcon };
  };

  const getTierBadge = () => {
    const tiers = {
      basic: { label: 'Basic', color: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' },
      premium: { label: 'Premium', color: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' },
      enterprise: { label: 'Enterprise', color: 'bg-orange-50 text-orange-700 ring-1 ring-orange-100' },
    };
    return tiers[restaurant.subscription_tier] || tiers.basic;
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;
  const tierBadge = getTierBadge();

  const handleStatusToggle = async () => {
    setIsLoading(true);
    try {
      await updateRestaurantStatus(restaurant.id, !restaurant.is_active);
      toast.success(`Restaurant ${!restaurant.is_active ? 'activated' : 'deactivated'} successfully`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsLoading(false);
      setShowStatusDialog(false);
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      await verifyRestaurant(restaurant.id, true);
      toast.success('Restaurant verified successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to verify restaurant');
    } finally {
      setIsLoading(false);
      setShowVerifyDialog(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteRestaurant(restaurant.id);
      toast.success('Restaurant deleted successfully');
      onUpdate();
    } catch (error) {
      // Prefer server-provided message when available for easier debugging
      const serverMessage = error?.response?.data?.message || error?.message || 'Failed to delete restaurant';
      console.error('Delete restaurant error:', error);
      toast.error(serverMessage);
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-none border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl">
        {/* Header with Logo */}
        <div
          className={`relative h-28 sm:h-32 ${!restaurant.cover_image_url ? 'bg-gradient-to-r from-orange-500 to-blue-500' : ''}`}
          style={restaurant.cover_image_url ? { backgroundImage: `url(${restaurant.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
              <div className="absolute -bottom-7 left-4">
                <img
                  src={restaurant.logo_url || restaurant.logo || restaurant.logoUrl || '/logo.svg'}
                  alt={restaurant.name}
                  className="h-12 w-12 rounded-none border-4 border-white bg-white object-cover sm:h-16 sm:w-16"
                  onError={(e) => { e.target.src = '/logo.svg'; }}
                />
              </div>
          <div className="absolute top-3 right-3 flex gap-2">
              <span className={`flex items-center gap-1 rounded-none px-2 py-1 text-xs font-semibold ${statusBadge.color}`}>
              <StatusIcon className="w-3 h-3" />
              {statusBadge.label}
            </span>
            <span className={`rounded-none px-2 py-1 text-xs font-semibold ${tierBadge.color}`}>
              {tierBadge.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-10">
          <h3 className="mb-1 text-lg font-black tracking-tight text-slate-900">{restaurant.name}</h3>
          <p className="mb-3 line-clamp-2 text-sm text-slate-500">{restaurant.description || 'No description'}</p>

          {/* Details */}
          <div className="space-y-2 mb-4 break-words">
            {restaurant.address && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPinIcon className="w-4 h-4 text-orange-400" />
                <span className="truncate">{restaurant.address}, {restaurant.city}</span>
              </div>
            )}
            {restaurant.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <PhoneIcon className="w-4 h-4 text-blue-400" />
                <span>{restaurant.phone}</span>
              </div>
            )}
            {restaurant.email && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <EnvelopeIcon className="w-4 h-4 text-orange-400" />
                <span className="truncate">{restaurant.email}</span>
              </div>
            )}
            {restaurant.cuisine_type && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <BuildingStorefrontIcon className="w-4 h-4 text-blue-400" />
                <span>{restaurant.cuisine_type}</span>
              </div>
            )}
          </div>

          {/* Owner Info */}
          {restaurant.owner && (
            <div className="mb-3 border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500">Owner</p>
              <p className="text-sm font-semibold text-slate-900">{restaurant.owner.full_name}</p>
              <p className="text-xs text-slate-500">{restaurant.owner.email}</p>
            </div>
          )}

          {/* Stats */}
          <div className="mb-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-2">
            <div className="text-center">
              <p className="text-lg font-black text-slate-900">{restaurant.total_menu_items || 0}</p>
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

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/platform/restaurants/${restaurant.id}`)}
              className="flex flex-1 items-center justify-center gap-1 rounded-none bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-700"
            >
              <EyeIcon className="w-4 h-4" />
              View
            </button>
            <button
              onClick={() => navigate(`/platform/restaurants/${restaurant.id}/edit`)}
              className="flex flex-1 items-center justify-center gap-1 rounded-none bg-gradient-to-r from-orange-500 to-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:from-orange-600 hover:to-blue-600"
            >
              <PencilIcon className="w-4 h-4" />
              Edit
            </button>
          </div>

          {/* Admin Actions */}
          <div className="mt-2 flex gap-2">
            {!restaurant.is_verified && restaurant.is_active && (
              <button
                onClick={() => setShowVerifyDialog(true)}
                className="flex flex-1 items-center justify-center gap-1 rounded-none bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                <ShieldCheckIcon className="w-4 h-4" />
                Verify
              </button>
            )}
            <button
              onClick={() => setShowStatusDialog(true)}
              className={`flex flex-1 items-center justify-center gap-1 rounded-none px-3 py-2 text-sm font-semibold transition-colors ${
                restaurant.is_active
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {restaurant.is_active ? (
                <><XCircleIcon className="w-4 h-4" /> Deactivate</>
              ) : (
                <><CheckCircleIcon className="w-4 h-4" /> Activate</>
              )}
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="rounded-none bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-700"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
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
  );
};

export default RestaurantCard;