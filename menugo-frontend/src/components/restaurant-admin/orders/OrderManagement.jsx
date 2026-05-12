import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { ArrowPathIcon, FunnelIcon } from '@heroicons/react/24/outline'
import OrderList from './OrderList'
import OrderTable from './OrderTable'
import OrderFilters from './OrderFilters'
import Tabs from '../../../common/Tabs'
import Loading from '../../../common/Loading'
import { getOrders } from '../../../services/orderService'
import { useWebSocket } from '../../../hooks/useWebSocket'
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

  const [exportPeriod, setExportPeriod] = useState('daily')

  const formatDate = (d) => {
    try { return new Date(d).toLocaleString() } catch (e) { return '' }
  }

  const filterByPeriod = (list, period) => {
    if (!Array.isArray(list)) return []
    const now = new Date()
    return list.filter(o => {
      const created = new Date(o.createdAt || o.created_at || o.created)
      if (Number.isNaN(created.getTime())) return false
      if (period === 'daily') {
        return created.toDateString() === now.toDateString()
      }
      if (period === 'weekly') {
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
        return created >= weekAgo && created <= now
      }
      if (period === 'monthly') {
        const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1)
        return created >= monthAgo && created <= now
      }
      return true
    })
  }

  const buildTableHtml = (ordersToExport) => {
    const rows = ordersToExport.map(o => {
      const items = (o.items || []).map(i => i.name || i.title || '').join(', ')
      return `<tr>
        <td>${o.id || o.orderNumber || ''}</td>
        <td>${o.customerName || o.customer_name || 'Guest'}</td>
        <td>${o.tableNumber || o.table_number || ''}</td>
        <td>${items}</td>
        <td>${o.itemCount || (o.items ? o.items.length : '')}</td>
        <td>${o.status || ''}</td>
        <td>${formatDate(o.createdAt || o.created_at)}</td>
        <td>${o.totalAmount || o.total || ''}</td>
      </tr>`
    }).join('\n')

    return `<!doctype html><html><head><meta charset="utf-8"><title>Orders Export</title>
      <style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px}</style>
      </head><body><h2>Orders Export</h2><table><thead><tr><th>Order ID</th><th>Customer</th><th>Table</th><th>Items</th><th>Count</th><th>Status</th><th>Created</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table></body></html>`
  }

  const download = (filename, blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = () => {
    const ordersToExport = filterByPeriod(data?.orders || [], exportPeriod)
    const header = ['Order ID','Customer','Table','Items','Count','Status','Created','Total']
    const csvRows = [header.join(',')]
    ordersToExport.forEach(o => {
      const items = (o.items || []).map(i => '"' + ((i.name||i.title||'').replace(/"/g,'""')) + '"').join(';')
      const row = [o.id||o.orderNumber||'', o.customerName||o.customer_name||'Guest', o.tableNumber||o.table_number||'', items, o.itemCount || (o.items ? o.items.length : ''), o.status||'', formatDate(o.createdAt||o.created_at), o.totalAmount||o.total||'']
      csvRows.push(row.map(v => `"${String(v).replace(/"/g,'""') }"`).join(','))
    })
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    download(`orders-${exportPeriod}.csv`, blob)
  }

  const handleExportExcel = () => {
    const ordersToExport = filterByPeriod(data?.orders || [], exportPeriod)
    const html = buildTableHtml(ordersToExport)
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
    download(`orders-${exportPeriod}.xls`, blob)
  }

  const handleExportWord = () => {
    const ordersToExport = filterByPeriod(data?.orders || [], exportPeriod)
    const html = buildTableHtml(ordersToExport)
    const blob = new Blob([html], { type: 'application/msword' })
    download(`orders-${exportPeriod}.doc`, blob)
  }

  const handlePrint = () => {
    const ordersToExport = filterByPeriod(data?.orders || [], exportPeriod)
    const html = buildTableHtml(ordersToExport)
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.focus()
    // let user choose Save as PDF or Print
    setTimeout(() => { w.print() }, 500)
  }

  const { data, isLoading, refetch } = useQuery(
    ['orders', user?.restaurant_id, filters],
    () => getOrders(user?.restaurant_id, filters),
    { enabled: !!user?.restaurant_id, refetchInterval: 10000 }
  )

  // When exportPeriod changes, update filters.dateRange so the displayed orders
  // reflect the selected period (daily/weekly/monthly/all)
  React.useEffect(() => {
    const now = new Date()
    let start = null
    let end = null
    if (exportPeriod === 'daily') {
      start = new Date(now); start.setHours(0,0,0,0)
      end = new Date(now); end.setHours(23,59,59,999)
    } else if (exportPeriod === 'weekly') {
      start = new Date(now); start.setDate(now.getDate() - 6); start.setHours(0,0,0,0)
      end = new Date(now); end.setHours(23,59,59,999)
    } else if (exportPeriod === 'monthly') {
      start = new Date(now.getFullYear(), now.getMonth(), 1); start.setHours(0,0,0,0)
      end = new Date(now); end.setHours(23,59,59,999)
    } else {
      // 'all' clears the date filter
      start = null; end = null
    }

    const startStr = start ? start.toISOString().slice(0,10) : null
    const endStr = end ? end.toISOString().slice(0,10) : null
    setFilters(prev => ({ ...prev, dateRange: startStr && endStr ? { start: startStr, end: endStr } : null }))
    // immediately refetch with new filters
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportPeriod, user?.restaurant_id])

  const { lastMessage } = useWebSocket()

  React.useEffect(() => {
    if (!lastMessage) return
    const types = ['new_order', 'order_updated', 'order_ready', 'order_verified', 'order_cancelled']
    if (types.includes(lastMessage.type)) {
      refetch()
    }
  }, [lastMessage, refetch])

  if (isLoading) return <Loading />

  const tabs = [
    { label: 'All Orders', count: data?.verified_total ?? data?.total },
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
            {/* Kitchen view removed per admin preference */}
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowPathIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <select value={exportPeriod} onChange={(e) => setExportPeriod(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 text-sm text-black bg-white">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="all">All</option>
          </select>
          <button onClick={handleExportCSV} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black bg-white hover:bg-gray-50">CSV</button>
          <button onClick={handleExportExcel} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black bg-white hover:bg-gray-50">Excel</button>
          <button onClick={handleExportWord} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black bg-white hover:bg-gray-50">Word</button>
          <button onClick={handlePrint} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black bg-white hover:bg-gray-50">Print / PDF</button>
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
        {/* Kitchen view removed — only list/table views available */}
      </div>
    </div>
  )
}

export default OrderManagement