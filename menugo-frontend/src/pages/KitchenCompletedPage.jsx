import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import KitchenCompletedOrders from '../components/kitchen/KitchenCompletedOrders'
import Loading from '../components/common/Loading'
import Pagination from '../components/common/Pagination'

const toLocalDateString = (value) => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const KitchenCompletedPage = () => {
  const location = useLocation()
  const [restaurantId, setRestaurantId] = useState(null)
  // default to today so Completed view shows today's orders by default
  const todayStr = toLocalDateString(new Date())
  const [dateRange, setDateRange] = useState({ start: todayStr, end: todayStr })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [paginationMeta, setPaginationMeta] = useState({ page: 1, limit: 20, total: 0, pages: 0 })

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')) || {}
    const id = user.restaurantId || user.restaurant_id || (user.restaurant && user.restaurant.id) || null
    const params = new URLSearchParams(location.search)
    const qId = params.get('restaurantId')
    setRestaurantId(qId || id)
  }, [location.search])

  const handleDateChange = (field) => (e) => {
    setDateRange(prev => ({ ...prev, [field]: e.target.value }))
    setPage(1)
  }

  const handleClear = () => {
    setDateRange({ start: '', end: '' })
    setPage(1)
  }

  const handlePaginationMeta = (meta) => {
    setPaginationMeta(prev => ({ ...prev, ...meta }))
  }

  if (!restaurantId && process.env.NODE_ENV !== 'development') return <Loading />

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Completed Orders</h1>
            <p className="text-sm text-gray-500">Review completed orders and historical reports</p>
          </div>

          <div className="flex space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={handleDateChange('start')}
              className="px-3 py-1 border rounded"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={handleDateChange('end')}
              className="px-3 py-1 border rounded"
            />
            <select
              value={limit}              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="px-3 py-1 border rounded"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <button
              onClick={handleClear}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <KitchenCompletedOrders
          restaurantId={restaurantId}
          page={page}
          limit={limit}
          dateRange={dateRange}
          onPaginationChange={handlePaginationMeta}
          showTitle={false}
        />
      </div>

      <div className="p-4 border-t">
        <Pagination
          currentPage={paginationMeta.page || page}
          totalPages={paginationMeta.pages || Math.max(1, Math.ceil((paginationMeta.total || 0) / (paginationMeta.limit || limit)))}
          onPageChange={(p) => setPage(p)}
        />
      </div>
    </div>
  )
}

export default KitchenCompletedPage
