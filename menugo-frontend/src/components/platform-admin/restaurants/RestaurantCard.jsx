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
      return { label: 'Inactive', color: 'bg-red-100 text-red-800', icon: XCircleIcon };
    }
    if (!restaurant.is_verified) {
      return { label: 'Pending Verification', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon };
    }
    return { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon };
  };

  const getTierBadge = () => {
    const tiers = {
      basic: { label: 'Basic', color: 'bg-gray-100 text-gray-800' },
      premium: { label: 'Premium', color: 'bg-purple-100 text-purple-800' },
      enterprise: { label: 'Enterprise', color: 'bg-gold-100 text-gold-800' },
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Header with Logo */}
        <div className="relative h-32 bg-gradient-to-r from-primary-500 to-primary-700">
          <div className="absolute -bottom-8 left-4">
            <img
              src={restaurant.logo_url || '/logo.svg'}
              alt={restaurant.name}
              className="w-16 h-16 rounded-xl border-4 border-white bg-white object-cover"
              onError={(e) => { e.target.src = '/logo.svg'; }}
            />
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.color}`}>
              <StatusIcon className="w-3 h-3" />
              {statusBadge.label}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tierBadge.color}`}>
              {tierBadge.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-10">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">{restaurant.name}</h3>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{restaurant.description || 'No description'}</p>

          {/* Details */}
          <div className="space-y-2 mb-4">
            {restaurant.address && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4 text-gray-400" />
                <span className="truncate">{restaurant.address}, {restaurant.city}</span>
              </div>
            )}
            {restaurant.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <PhoneIcon className="w-4 h-4 text-gray-400" />
                <span>{restaurant.phone}</span>
              </div>
            )}
            {restaurant.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                <span className="truncate">{restaurant.email}</span>
              </div>
            )}
            {restaurant.cuisine_type && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BuildingStorefrontIcon className="w-4 h-4 text-gray-400" />
                <span>{restaurant.cuisine_type}</span>
              </div>
            )}
          </div>

          {/* Owner Info */}
          {restaurant.owner && (
            <div className="border-t border-gray-100 pt-3 mb-3">
              <p className="text-xs text-gray-500">Owner</p>
              <p className="text-sm font-medium text-gray-900">{restaurant.owner.full_name}</p>
              <p className="text-xs text-gray-500">{restaurant.owner.email}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4 pt-2 border-t border-gray-100">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{restaurant.total_menu_items || 0}</p>
              <p className="text-xs text-gray-500">Menu Items</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{restaurant.total_orders || 0}</p>
              <p className="text-xs text-gray-500">Orders</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{restaurant.average_rating || 0}</p>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/platform/restaurants/${restaurant.id}`)}
              className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
            >
              <EyeIcon className="w-4 h-4" />
              View
            </button>
            <button
              onClick={() => navigate(`/platform/restaurants/${restaurant.id}/edit`)}
              className="flex-1 px-3 py-2 text-sm bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center gap-1"
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
                className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
              >
                <ShieldCheckIcon className="w-4 h-4" />
                Verify
              </button>
            )}
            <button
              onClick={() => setShowStatusDialog(true)}
              className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-center gap-1 ${
                restaurant.is_active
                  ? 'bg-red-50 text-red-700 hover:bg-red-100'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
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
              className="px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
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