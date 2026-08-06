import {useState} from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { PlusIcon, TagIcon } from '@heroicons/react/24/outline'
import CouponList from './CouponList'
import CouponCard from './CouponCard'
import CouponForm from './CouponForm'
import CouponAnalytics from './CouponAnalytics'
import Button from '../../../common/Button'
import Loading from '../../../common/Loading'
import Modal from '../../../common/Modal'
import Tabs from '../../../common/Tabs'
import { getCoupons } from '../../../services/promotionService'

const CouponManagement = () => {
  const [viewMode, setViewMode] = useState('grid')
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)

  const { data: coupons, isLoading, refetch } = useQuery('coupons', getCoupons)

  if (isLoading) return <Loading />

  const activeCoupons = coupons?.filter(c => c.isActive && new Date(c.endDate) > new Date()) || []
  const expiredCoupons = coupons?.filter(c => !c.isActive || new Date(c.endDate) <= new Date()) || []

  const tabs = [
    { label: 'Active Coupons', count: activeCoupons.length, content: renderCouponsContent(activeCoupons) },
    { label: 'Expired', count: expiredCoupons.length, content: renderCouponsContent(expiredCoupons) },
    { label: 'Analytics', content: <CouponAnalytics coupons={coupons || []} /> },
  ]

  function renderCouponsContent(couponsList) {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Promotions & Coupons</h1>
            <p className="text-gray-500 mt-1">Create and manage discount offers</p>
          </div>
          <div className="flex gap-3">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
              >
                List
              </button>
            </div>
            <Button onClick={() => setShowModal(true)} icon={PlusIcon}>
              Create Coupon
            </Button>
          </div>
        </div>

        {couponsList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <TagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No coupons found</h3>
            <p className="text-gray-500 mt-1">Create your first coupon to start promoting</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {couponsList.map((coupon, index) => (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CouponCard
                  coupon={coupon}
                  onEdit={() => {
                    setEditingCoupon(coupon)
                    setShowModal(true)
                  }}
                  onRefresh={refetch}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <CouponList coupons={couponsList} onEdit={setEditingCoupon} onRefresh={refetch} />
        )}
      </>
    )
  }

  return (
    <div className="p-6">
      <Tabs tabs={tabs} />
      
      <CouponForm
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingCoupon(null)
        }}
        coupon={editingCoupon}
        onSuccess={() => {
          refetch()
          setShowModal(false)
          setEditingCoupon(null)
        }}
      />
    </div>
  )
}

export default CouponManagement