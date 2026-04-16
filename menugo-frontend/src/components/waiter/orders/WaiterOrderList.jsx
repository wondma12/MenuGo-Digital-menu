import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import WaiterOrderCard from './WaiterOrderCard'
import OrderFilters from './OrderFilters'
import OrderSearch from './OrderSearch'
import OrderStatusBadge from './OrderStatusBadge'
import Loading from '../../common/Loading'
import { getWaiterOrders } from '../../../services/waiterService'

const WaiterOrderList = () => {
  const [filters, setFilters] = useState({ status: 'all', priority: 'all' })
  const [searchTerm, setSearchTerm] = useState('')

  const { data: orders, isLoading, refetch } = useQuery(
    ['waiterOrders', filters, searchTerm],
    () => getWaiterOrders({ ...filters, search: searchTerm }),
    { refetchInterval: 10000 }
  )

  if (isLoading) return <Loading />

  const groupedOrders = {
    pending: orders?.filter(o => o.status === 'pending') || [],
    verified: orders?.filter(o => o.status === 'verified') || [],
    preparing: orders?.filter(o => o.status === 'preparing') || [],
    ready: orders?.filter(o => o.status === 'ready') || [],
    served: orders?.filter(o => o.status === 'served') || []
  }

  const statusTitles = {
    pending: '🆕 New Orders',
    verified: '✅ Verified',
    preparing: '🔪 Preparing',
    ready: '🍽️ Ready to Serve',
    served: '✨ Served'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <OrderSearch value={searchTerm} onChange={setSearchTerm} />
        <OrderFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {Object.entries(groupedOrders).map(([status, statusOrders]) =>
        statusOrders.length > 0 && (
          <div key={status}>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{statusTitles[status]}</h2>
              <OrderStatusBadge status={status} size="sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statusOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <WaiterOrderCard order={order} onRefresh={refetch} />
                </motion.div>
              ))}
            </div>
          </div>
        )
      )}

      {orders?.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No orders found</p>
        </div>
      )}
    </div>
  )
}

export default WaiterOrderList