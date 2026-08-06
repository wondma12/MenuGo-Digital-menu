import {useState} from 'react'
import { motion } from 'framer-motion'
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'
import ConfirmationDialog from '../../../common/ConfirmationDialog'
import { updateCouponStatus, deleteCoupon } from '../../../services/promotionService'
import toast from 'react-hot-toast'
import { formatPrice } from '../../../utils/currency'

const CouponList = ({ coupons, onEdit, onRefresh }) => {
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleStatusToggle = async (coupon) => {
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
      await deleteCoupon(deleteTarget.id)
      toast.success('Coupon deleted successfully')
      onRefresh()
      setDeleteTarget(null)
    } catch (error) {
      toast.error('Failed to delete coupon')
    }
  }

  const getDiscountDisplay = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`
    }
    return `${formatPrice(coupon.discountValue)} OFF`
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {coupons.map((coupon, index) => (
                <motion.tr
                  key={coupon.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-mono font-bold text-gray-900">{coupon.code}</p>
                      <p className="text-xs text-gray-500">{coupon.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="success" size="sm">{getDiscountDisplay(coupon)}</Badge>
                    {coupon.minimumOrderAmount && (
                      <p className="text-xs text-gray-500 mt-1">Min: {formatPrice(coupon.minimumOrderAmount)}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {coupon.usedCount} / {coupon.usageLimit || '∞'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleStatusToggle(coupon)}
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        coupon.isActive && new Date(coupon.endDate) > new Date()
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {coupon.isActive && new Date(coupon.endDate) > new Date() ? (
                        <EyeIcon className="w-3 h-3" />
                      ) : (
                        <EyeSlashIcon className="w-3 h-3" />
                      )}
                      {coupon.isActive && new Date(coupon.endDate) > new Date() ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(coupon)} className="p-1 text-gray-500 hover:text-primary-600">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(coupon)} className="p-1 text-gray-500 hover:text-red-600">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message={`Are you sure you want to delete coupon "${deleteTarget?.code}"?`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  )
}

export default CouponList