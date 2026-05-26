import React from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import WaiterStats from './WaiterStats'
import TodayMetrics from './TodayMetrics'
import PerformanceChart from './PerformanceChart'
import Loading from '../../common/Loading'
import { getWaiterDashboard } from '../../../services/waiterService'
import WaiterOrderList from '../orders/WaiterOrderList'

const WaiterDashboard = () => {
  const { data, isLoading, refetch } = useQuery('waiterDashboard', getWaiterDashboard, {
    refetchInterval: 30000
  })
  // Notifications removed from dashboard per request

  if (isLoading) return <Loading />

  return (
    <>
      <div className="space-y-6 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-orange-100 bg-white px-4 py-5 shadow-sm sm:px-5 sm:py-6"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,146,60,0.12),transparent_45%),_radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.08),transparent_55%)]" />
          <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Service overview</p>
          <h1 className="mt-1.5 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">Waiter Dashboard</h1>
          <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
            Welcome back, {data?.waiterName}! Keep orders moving and watch live performance from here.
          </p>
          </div>
        </motion.div>

        <WaiterStats stats={data?.stats} />

        <TodayMetrics metrics={data?.todayMetrics} />

        {/* <PerformanceChart data={data?.performanceData} /> */}

        <div className="rounded-3xl border border-orange-100 bg-white p-3 shadow-sm sm:p-4 lg:p-5">
          <WaiterOrderList />
        </div>
      </div>
    </>
  )
}

export default WaiterDashboard