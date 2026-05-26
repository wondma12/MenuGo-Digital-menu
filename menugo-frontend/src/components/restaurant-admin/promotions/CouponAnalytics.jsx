import React from 'react'
import { motion } from 'framer-motion'
import { ChartBarIcon, TagIcon, CurrencyDollarIcon, UsersIcon } from '@heroicons/react/24/outline'
import { formatPrice } from '../../../utils/currency'

const CouponAnalytics = ({ coupons }) => {
  const totalCoupons = coupons.length
  const activeCoupons = coupons.filter(c => c.isActive && new Date(c.endDate) > new Date()).length
  const totalUsage = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)
  const totalDiscountGiven = coupons.reduce((sum, c) => {
    // This would need actual order data, using placeholder calculation
    return sum + ((c.usedCount || 0) * (c.discountType === 'percentage' ? 10 : c.discountValue))
  }, 0)

  const mostUsedCoupon = coupons.reduce((max, c) => (c.usedCount > (max?.usedCount || 0) ? c : max), null)

  const stats = [
    { label: 'Total Coupons', value: totalCoupons, icon: TagIcon, color: 'blue' },
    { label: 'Active Coupons', value: activeCoupons, icon: ChartBarIcon, color: 'green' },
    { label: 'Total Redemptions', value: totalUsage, icon: UsersIcon, color: 'purple' },
    { label: 'Est. Discount Given', value: formatPrice(totalDiscountGiven.toFixed(2)), icon: CurrencyDollarIcon, color: 'orange' },
  ]

  const borderColors = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    purple: 'border-l-purple-500',
    yellow: 'border-l-yellow-500',
    red: 'border-l-red-500',
    orange: 'border-l-orange-500',
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-xl p-4 border border-gray-200 border-l-4 ${borderColors[stat.color] || 'border-l-blue-500'}`}>
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {mostUsedCoupon && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-5 text-white">
          <h3 className="text-lg font-semibold mb-2">🏆 Most Popular Coupon</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-mono font-bold">{mostUsedCoupon.code}</p>
              <p className="text-primary-100 mt-1">{mostUsedCoupon.usedCount} redemptions</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Discount</p>
              <p className="text-xl font-bold">
                {mostUsedCoupon.discountType === 'percentage' 
                  ? `${mostUsedCoupon.discountValue}% OFF` 
                  : `${formatPrice(mostUsedCoupon.discountValue)} OFF`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Coupon Performance</h3>
        <div className="space-y-3">
          {coupons.slice(0, 10).map((coupon) => (
            <div key={coupon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-mono font-medium text-gray-900">{coupon.code}</p>
                <p className="text-xs text-gray-500">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `${formatPrice(coupon.discountValue)} OFF`}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{coupon.usedCount || 0} uses</p>
                <p className="text-xs text-gray-400">
                  {coupon.usageLimit ? `${coupon.usageLimit - (coupon.usedCount || 0)} left` : 'Unlimited'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CouponAnalytics