
import { useQuery } from 'react-query'
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
    <div className="relative space-y-6 overflow-visible bg-white p-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),transparent_32%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6 overflow-visible">
        <div className="relative z-20 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Waiter Dashboard</h1>
            <p className="max-w-2xl text-sm text-slate-500 sm:text-base">
              Welcome back, {data?.waiterName}! Track service progress, orders, tips, and customer feedback from one polished workspace.
            </p>
          </div>
          <div className="relative z-50 inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">
            Live service overview
          </div>
        </div>

        <WaiterStats stats={data?.stats} />

        <TodayMetrics metrics={data?.todayMetrics} />

        {/* <PerformanceChart data={data?.performanceData} /> */}

        <div className="rounded-3xl border border-orange-100 bg-white p-3 shadow-sm sm:p-4 lg:p-5">
          <WaiterOrderList />
        </div>
      </div>
    </div>
  )
}

export default WaiterDashboard