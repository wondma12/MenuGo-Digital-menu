import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { ArrowPathIcon, FunnelIcon } from '@heroicons/react/24/outline'
import OrderList from './OrderList'
import OrderTable from './OrderTable'
import OrderFilters from './OrderFilters'
import KitchenDisplay from './KitchenDisplay'
import Tabs from '../../../common/Tabs'
import Loading from '../../../common/Loading'
import { getOrders } from '../../../services/orderService'
import { useAuthStore } from '../../../store/authStore'

const OrderManagement = () => {
  const [viewMode, setViewMode] = useState('list')
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: null,
    search: '',
  })
  const [activeTab, setActiveTab] = useState(0)

  const { user } = useAuthStore()

  const { data, isLoading, refetch } = useQuery(
    ['orders', user?.restaurant_id, filters],
    () => getOrders(user?.restaurant_id, filters),
    { enabled: !!user?.restaurant_id, refetchInterval: 10000 }
  )

  if (isLoading) return <Loading />

  const tabs = [
    { label: 'All Orders', count: data?.total },
    { label: 'Pending', count: data?.pending },
    { label: 'Preparing', count: data?.preparing },
    { label: 'Ready', count: data?.ready },
    { label: 'Completed', count: data?.completed },
  ]

  const getTabFilter = (tabIndex) => {
    const statusMap = {
      0: 'all',
      1: 'pending',
      2: 'preparing',
      3: 'ready',
      4: 'completed',
    }
    return statusMap[tabIndex]
  }

  const handleTabChange = (index) => {
    setActiveTab(index)
    setFilters({ ...filters, status: getTabFilter(index) })
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500 mt-1">Track and manage all customer orders</p>
        </div>
        <div className="flex gap-3">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('kitchen')}
              className={`px-3 py-2 text-sm ${viewMode === 'kitchen' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
            >
              Kitchen View
            </button>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowPathIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab={activeTab} onChange={handleTabChange} />

      {/* Filters */}
      <div className="mt-6">
        <OrderFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Orders Display */}
      <div className="mt-6">
        {viewMode === 'list' && (
          <OrderList orders={data?.orders || []} onRefresh={refetch} />
        )}
        {viewMode === 'table' && (
          <OrderTable orders={data?.orders || []} onRefresh={refetch} />
        )}
        {viewMode === 'kitchen' && (
          <KitchenDisplay orders={data?.orders || []} onRefresh={refetch} />
        )}
      </div>
    </div>
  )
}

export default OrderManagement