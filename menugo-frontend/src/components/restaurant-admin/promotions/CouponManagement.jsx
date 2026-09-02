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

  const getCouponEndDate = (value) => {
    const dateValue = String(value || '')
    return /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
      ? new Date(`${dateValue}T23:59:59.999`)
      : new Date(value)
  }
  const isCouponExpired = (coupon) => {
    const endDate = getCouponEndDate(coupon.endDate)
    return endDate < new Date()
  }
  const activeCoupons = coupons?.filter(c => c.isActive && !isCouponExpired(c)) || []
  const expiredCoupons = coupons?.filter(c => !c.isActive || isCouponExpired(c)) || []

  const tabs = [
    { label: 'Active Coupons', count: activeCoupons.length, content: renderCouponsContent(activeCoupons) },
    { label: 'Expired', count: expiredCoupons.length, content: renderCouponsContent(expiredCoupons) },
    { label: 'Analytics', content: <CouponAnalytics coupons={coupons || []} /> },
  ]

  function renderCouponsContent(couponsList) {
    return (
      <>
        <div className="mb-6 flex flex-col gap-4 rounded-none border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Restaurant promotions</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Promotions & Coupons</h1>
            <p className="text-sm leading-6 text-slate-500 sm:text-base">Create and manage discount offers for your customers.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="flex w-full overflow-hidden rounded-none border border-slate-200 sm:w-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-orange-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'} sm:flex-none`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-orange-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'} sm:flex-none`}
              >
                List
              </button>
            </div>
            <Button onClick={() => setShowModal(true)} icon={PlusIcon} className="w-full rounded-none bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2.5 text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-orange-600 sm:w-auto">
              Create Coupon
            </Button>
          </div>
        </div>

        {couponsList.length === 0 ? (
          <div className="border border-slate-200 bg-white py-12 text-center shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <TagIcon className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900">No coupons found</h3>
            <p className="mt-1 text-slate-500">Create your first coupon to start promoting</p>
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
    <div className="relative space-y-6 overflow-hidden bg-white p-4 font-['Manrope',system-ui,sans-serif] text-slate-900 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.08),transparent_35%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />
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