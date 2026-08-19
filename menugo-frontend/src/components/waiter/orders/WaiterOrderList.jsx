import {useState, useEffect} from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { Clock, Check, Activity, SearchX, Eye, ChevronRight } from 'lucide-react'
import WaiterOrderCard from './WaiterOrderCard'
import OrderFilters from './OrderFilters'
import OrderStatusBadge from './OrderStatusBadge'
import OrderDetailsModal from '../order-details/OrderDetailsModal'
import Loading from '../../common/Loading'
import { getWaiterOrders } from '../../../services/waiterService'
import { useWebSocket } from '../../../hooks/useWebSocket'
import { useAudio } from '../../../hooks/useAudio'

const CompletedOrderRow = ({ order, displayNumber, onOpen }) => {
  const tableSection = order?.tableSection || order?.table_section || order?.table?.section || order?.raw?.order_table?.section || 'General'
  const tableNumber = order?.tableNumber || order?.table_number || order?.table?.number || '-'
  const itemCount = order?.itemCount ?? order?.items?.length ?? 0
  const itemNames = Array.isArray(order?.items)
    ? order.items.map((item) => item.name ?? item.title ?? '').filter(Boolean).join(', ')
    : '-'
  const total = Number(order?.totalAmount ?? order?.total ?? order?.total_amount ?? 0)
  const createdAt = new Date(order?.createdAt)
  const elapsedMinutes = Number.isNaN(createdAt.getTime()) ? 0 : Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 60000))
  const elapsed = elapsedMinutes < 60
    ? `${elapsedMinutes} min ago`
    : `${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m ago`

  return (
    <>
      <tr
        className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-orange-50/40"
        onClick={onOpen}
      >
        <td className="whitespace-nowrap px-4 py-4 text-sm font-black text-slate-900">#{displayNumber}</td>
        <td className="px-4 py-4 font-semibold text-slate-800">{order?.customerName ?? order?.customer?.name ?? 'Guest'}</td>
        <td className="px-4 py-4">
          <div className="font-semibold text-slate-800">Table {tableNumber}</div>
        </td>
        <td className="px-4 py-4 text-sm text-slate-600">{tableSection}</td>
        <td className="w-24 px-1 py-4">
          <div className="font-semibold text-slate-800">{itemCount} items</div>
          <div className="mt-1 max-w-xs truncate text-xs text-slate-500">{itemNames}</div>
        </td>
        <td className="w-24 whitespace-nowrap px-1 py-4 text-sm text-slate-500">{elapsed}</td>
        <td className="whitespace-nowrap px-2 py-4 text-sm font-black text-orange-600">Br {Number.isNaN(total) ? '0.00' : total.toFixed(2)}</td>
        <td className="px-2 py-4 text-right">
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); onOpen() }}
            className="inline-flex items-center gap-1 rounded-none bg-gradient-to-r from-orange-600 to-orange-500 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:-translate-y-0.5 hover:from-orange-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
          >
            <Eye className="h-3.5 w-3.5" />
            Details
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </td>
      </tr>
    </>
  )
}

const CompletedOrdersTable = ({ orders, orderIndexMap, onRefresh }) => {
  const [selectedOrder, setSelectedOrder] = useState(null)

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Guest</th>
                <th className="px-4 py-3 font-semibold">Table</th>
                <th className="px-4 py-3 font-semibold">Section</th>
                <th className="w-24 px-1 py-3 font-semibold">Items</th>
                <th className="w-24 px-1 py-3 font-semibold">Completed</th>
                <th className="px-2 py-3 font-semibold">Total</th>
                <th className="px-2 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <CompletedOrderRow
                  key={order.id}
                  order={order}
                  displayNumber={orderIndexMap[order.id]}
                  onOpen={() => setSelectedOrder(order)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          displayNumber={orderIndexMap[selectedOrder.id]}
          onClose={() => setSelectedOrder(null)}
          onRefresh={onRefresh}
        />
      )}
    </>
  )
}

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
        try { playSound('new-order') } catch (e) { if (import.meta.env.DEV) console.warn('playSound failed:', e && e.message) }
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
        <div className="relative z-20 flex flex-col gap-4">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Waiter Orders </h1>
            <p className="max-w-2xl text-sm text-slate-500 sm:text-base">Search, filter, and move orders through the service line from one polished workspace.</p>
          </div>
          <OrderFilters
            filters={filters}
            onFiltersChange={setFilters}
            sections={sections}
            sectionFilter={sectionFilter}
            onSectionChange={setSectionFilter}
          />
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
              {status === 'completed' ? (
                <CompletedOrdersTable orders={statusOrders} orderIndexMap={orderIndexMap} onRefresh={refetch} />
              ) : (
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
              )}
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