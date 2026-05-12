import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { Clock, Check, Activity } from 'lucide-react'
import WaiterOrderCard from './WaiterOrderCard'
import OrderFilters from './OrderFilters'
import OrderSearch from './OrderSearch'
import OrderStatusBadge from './OrderStatusBadge'
import Loading from '../../common/Loading'
import { getWaiterOrders } from '../../../services/waiterService'
import { useWebSocket } from '../../../hooks/useWebSocket'
import { useAudio } from '../../../hooks/useAudio'

const WaiterOrderList = () => {
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', range: 'all' })
  const [searchTerm, setSearchTerm] = useState('')

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

  const groupedOrders = {
    pending: orders?.filter(o => o.status === 'pending') || [],
    verified: orders?.filter(o => o.status === 'verified') || [],
    preparing: orders?.filter(o => o.status === 'preparing') || [],
    ready: orders?.filter(o => o.status === 'ready') || [],
    completed: orders?.filter(o => o.status === 'completed') || []
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
  orders?.forEach((o, i) => { if (o && o.id) orderIndexMap[o.id] = i + 1 })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <OrderSearch value={searchTerm} onChange={setSearchTerm} />
        <OrderFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {Object.entries(groupedOrders).map(([status, statusOrders]) =>
        statusOrders.length > 0 && (
          <div key={status}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-gray-900">{statusTitles[status].icon}{statusTitles[status].label}</h2>
              <OrderStatusBadge status={status} size="sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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

      {orders?.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg border border-gray-200/25">
          <p className="text-gray-500">No orders found</p>
        </div>
      )}
    </div>
  )
}

export default WaiterOrderList