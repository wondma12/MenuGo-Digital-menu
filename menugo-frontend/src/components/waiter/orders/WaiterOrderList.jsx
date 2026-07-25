import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { Clock, Check, Activity, SearchX } from 'lucide-react'
import WaiterOrderCard from './WaiterOrderCard'
import OrderFilters from './OrderFilters'
import OrderStatusBadge from './OrderStatusBadge'
import Loading from '../../common/Loading'
import { getWaiterOrders } from '../../../services/waiterService'
import { useWebSocket } from '../../../hooks/useWebSocket'
import { useAudio } from '../../../hooks/useAudio'

const WaiterOrderList = () => {
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', range: 'all' })
  const [searchTerm, setSearchTerm] = useState('')
  const [sectionFilter, setSectionFilter] = useState('all')

  const { data: orders, isLoading, refetch } = useQuery(
    ['waiterOrders', filters, searchTerm],
    () => getWaiterOrders({ ...filters, search: searchTerm }),
    { refetchInterval: 10000 }
  )

  const { onEvent } = useWebSocket()
  const { playSound } = useAudio()

  // Refresh list on relevant socket events
  useEffect(() => {
    if (!onEvent) return

    const handleRefresh = (data) => {
      // play a subtle notification for verified/kitchen updates
      if (data && (data.type === 'new_order' || data.type === 'order_verified')) {
        try { playSound('new-order') } catch (e) {}
      }
      refetch()
    }

    const unsubNew = onEvent('new_order', handleRefresh)
    const unsubVerified = onEvent('order_verified', handleRefresh)
    const unsubUpdated = onEvent('order_updated', handleRefresh)
    const unsubKitchen = onEvent('kitchen_updated', handleRefresh)

    return () => {
      unsubNew && unsubNew()
      unsubVerified && unsubVerified()
      unsubUpdated && unsubUpdated()
      unsubKitchen && unsubKitchen()
    }
  }, [onEvent, refetch, playSound])

  if (isLoading) return <Loading />

  const orderList = Array.isArray(orders) ? orders : []
  const sections = [...new Set(orderList.map((order) => order?.tableSection || order?.table_section || order?.table?.section || order?.raw?.order_table?.section || 'General'))].sort()
  const visibleOrders = orderList.filter((order) => {
    const section = order?.tableSection || order?.table_section || order?.table?.section || order?.raw?.order_table?.section || 'General'
    return sectionFilter === 'all' || section === sectionFilter
  })

  const groupedOrders = {
    pending: visibleOrders.filter(o => o.status === 'pending'),
    verified: visibleOrders.filter(o => o.status === 'verified'),
    preparing: visibleOrders.filter(o => o.status === 'preparing'),
    ready: visibleOrders.filter(o => o.status === 'ready'),
    completed: visibleOrders.filter(o => o.status === 'completed')
  }

  const statusTitles = {
    pending: { label: 'New Orders', icon: <Clock className="w-4 h-4 inline-block mr-2" /> },
    verified: { label: 'Verified', icon: <Check className="w-4 h-4 inline-block mr-2" /> },
    preparing: { label: 'Preparing', icon: <Activity className="w-4 h-4 inline-block mr-2" /> },
    ready: { label: 'Ready to Serve', icon: <Check className="w-4 h-4 inline-block mr-2" /> },
    completed: { label: 'Completed', icon: <Check className="w-4 h-4 inline-block mr-2" /> }
  }

  // Build a stable sequential mapping for display numbers (1-based)
  const orderIndexMap = {}
  orderList.forEach((o, i) => { if (o && o.id) orderIndexMap[o.id] = i + 1 })

  return (
    <div className="relative space-y-6 overflow-visible bg-white p-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),transparent_32%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6 overflow-visible">
        <div className="relative z-20 flex flex-col col-2 gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Waiter Orders </h1>
            <p className="max-w-2xl text-sm text-slate-500 sm:text-base">Search, filter, and move orders through the service line from one polished workspace.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={sectionFilter}
              onChange={(event) => setSectionFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold capitalize text-slate-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            >
              <option value="all">Filter by section</option>
              {sections.map((section) => <option key={section} value={section}>{section}</option>)}
            </select>
            <OrderFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>

        <div className="space-y-8">
        {Object.entries(groupedOrders).map(([status, statusOrders]) =>
          statusOrders.length > 0 && (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">{statusTitles[status].icon}{statusTitles[status].label}</h2>
                <OrderStatusBadge status={status} size="sm" />
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">{statusOrders.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {statusOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <WaiterOrderCard order={order} displayNumber={orderIndexMap[order.id]} onRefresh={refetch} />
                  </motion.div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {orderList.length === 0 && (
        <div className="rounded-3xl border border-dashed border-orange-100 bg-gradient-to-br from-white to-orange-50/40 p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
            <SearchX className="h-5 w-5" />
          </div>
          <p className="text-base font-semibold text-slate-900">No orders found</p>
          <p className="mt-1 text-sm text-slate-500">Try clearing filters or adjusting your search.</p>
        </div>
      )}
      {orderList.length > 0 && visibleOrders.length === 0 && (
        <div className="rounded-3xl border border-dashed border-orange-100 bg-orange-50/30 p-8 text-center shadow-sm">
          <SearchX className="mx-auto h-6 w-6 text-orange-500" />
          <p className="mt-2 text-base font-semibold text-slate-900">No orders in this section</p>
          <p className="mt-1 text-sm text-slate-500">Choose another section to see its table orders.</p>
        </div>
      )}
      </div>
    </div>
  )
}

export default WaiterOrderList