import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import OrderTable from './OrderTable'
import OrderFilters from './OrderFilters'
import Tabs from '../../../common/Tabs'
import Loading from '../../../common/Loading'
import { getOrders } from '../../../services/orderService'
import { useWebSocket } from '../../../hooks/useWebSocket'
import { useAuthStore } from '../../../store/authStore'
import { formatCurrency } from '../../../utils/formatters'

const OrderManagement = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: null,
    search: '',
  })
  const [activeTab, setActiveTab] = useState(0)

  const { user } = useAuthStore()

  const [exportPeriod, setExportPeriod] = useState('daily')
  const [exportFormat, setExportFormat] = useState('csv')

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
        <td>${formatCurrency(o.totalAmount || o.total || 0)}</td>
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
      const row = [o.id||o.orderNumber||'', o.customerName||o.customer_name||'Guest', o.tableNumber||o.table_number||'', items, o.itemCount || (o.items ? o.items.length : ''), o.status||'', formatDate(o.createdAt||o.created_at), formatCurrency(o.totalAmount||o.total||0)]
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

  const handleDownloadExport = () => {
    if (exportFormat === 'csv') return handleExportCSV()
    if (exportFormat === 'excel') return handleExportExcel()
    if (exportFormat === 'word') return handleExportWord()
    if (exportFormat === 'pdf') return handlePrint()
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

    setFilters(prev => ({ ...prev, dateRange: start && end ? { start, end } : null }))
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

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters)
    if (nextFilters.dateRange) {
      setExportPeriod('all')
    }
  }

  return (
    <div className="relative overflow-hidden space-y-6 bg-white p-4 sm:p-6 lg:p-8 font-['Manrope',system-ui,sans-serif] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.08),transparent_35%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Restaurant orders</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Order Management</h1>
            <p className="text-sm leading-6 text-slate-500 sm:text-base">Track and manage all customer orders with the analytics palette.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <select value={exportPeriod} onChange={(e) => setExportPeriod(e.target.value)} className="border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-700 bg-white shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="all">All</option>
            </select>
            <div className="flex items-center overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
              <div className="relative">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="appearance-none border-0 bg-white py-2 pl-3 pr-9 text-sm text-slate-700 focus:outline-none focus:ring-0"
            >
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="word">Word</option>
              <option value="pdf">Print / PDF</option>
            </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              <button
                onClick={handleDownloadExport}
                className="bg-gradient-to-r from-orange-500 to-blue-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:from-orange-600 hover:to-blue-600"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Tabs */}
        <Tabs tabs={tabs} defaultTab={activeTab} onChange={handleTabChange} />

        {/* Filters */}
        <div>
          <OrderFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </div>

        {/* Orders Display */}
        <div>
          <OrderTable orders={data?.orders || []} onRefresh={refetch} />
        </div>
      </div>
    </div>
  )
}

export default OrderManagement