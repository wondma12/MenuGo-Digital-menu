import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, CalendarIcon } from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'
import ConfirmationDialog from '../../../common/ConfirmationDialog'
import { updateCouponStatus, deleteCoupon } from '../../../services/promotionService'
import toast from 'react-hot-toast'
import { formatPrice } from '../../../utils/currency'

const CouponCard = ({ coupon, onEdit, onRefresh }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleStatusToggle = async () => {
    try {
      await updateCouponStatus(coupon.id, !coupon.isActive)
      toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}`)
      onRefresh()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCoupon(coupon.id)
      toast.success('Coupon deleted successfully')
      onRefresh()
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error('Failed to delete coupon')
    }
  }

  const getDiscountDisplay = () => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`
    }
    return `${formatPrice(coupon.discountValue)} OFF`
  }

  const isExpired = new Date(coupon.endDate) <= new Date()
  const isActive = coupon.isActive && !isExpired

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden hover:shadow-md transition-all ${
          isActive ? 'border-green-200' : 'border-gray-200 opacity-70'
        }`}
      >
        <div className="relative">
          <div className="absolute top-3 right-3 flex gap-1">
            <button onClick={onEdit} className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50">
              <PencilIcon className="w-4 h-4 text-gray-600" />
            </button>
            <button onClick={() => setShowDeleteDialog(true)} className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-red-50">
              <TrashIcon className="w-4 h-4 text-red-600" />
            </button>
          </div>
          <div className="p-5">
            <div className="text-center mb-4">
              <div className="inline-block px-4 py-2 bg-primary-100 rounded-lg mb-3">
                <span className="text-2xl font-bold text-primary-600">{getDiscountDisplay()}</span>
              </div>
              <h3 className="font-mono font-bold text-xl text-gray-900">{coupon.code}</h3>
              <p className="text-sm text-gray-500 mt-1">{coupon.description}</p>
            </div>

            <div className="space-y-2 mb-4">
              {coupon.minimumOrderAmount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Min. Order:</span>
                  <span className="font-medium text-gray-900">{formatPrice(coupon.minimumOrderAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Valid:</span>
                <span className="text-gray-600">
                  {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Usage:</span>
                <span className="text-gray-600">{coupon.usedCount} / {coupon.usageLimit || '∞'}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={handleStatusToggle}
                className={`flex-1 px-3 py-1.5 text-sm rounded-lg flex items-center justify-center gap-1 ${
                  isActive
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isActive ? <EyeIcon className="w-3 h-3" /> : <EyeSlashIcon className="w-3 h-3" />}
                {isActive ? 'Active' : 'Inactive'}
              </button>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <CalendarIcon className="w-3 h-3" />
                {isExpired ? 'Expired' : `${Math.ceil((new Date(coupon.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days left`}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message={`Are you sure you want to delete coupon "${coupon.code}"?`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  )
}

export default CouponCard