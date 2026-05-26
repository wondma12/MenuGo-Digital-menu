import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, User, MapPin, Eye, ChevronRight } from 'lucide-react'
import OrderStatusBadge from './OrderStatusBadge'
import OrderPriorityBadge from './OrderPriorityBadge'
import OrderDetailsModal from '../order-details/OrderDetailsModal'

const WaiterOrderCard = ({ order, displayNumber, onRefresh }) => {
  const [showDetails, setShowDetails] = useState(false)

  const getTimeElapsed = (createdAt) => {
    const minutes = Math.floor((new Date() - new Date(createdAt)) / 60000)
    if (minutes < 60) return `${minutes} min ago`
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`
  }

  const formatMoney = (value) => {
    const numberValue = Number(value)
    if (Number.isNaN(numberValue)) return '0.00'
    return numberValue.toFixed(2)
  }

  const computeItemsTotal = (items) => {
    if (!Array.isArray(items) || items.length === 0) return 0
    return items.reduce((sum, item) => {
      const unitPrice = Number(item.unitPrice ?? item.price ?? 0)
      const quantity = Number(item.quantity ?? item.qty ?? 1)
      return sum + unitPrice * quantity
    }, 0)
  }

  const displayTotal = (() => {
    if (!order) return '0.00'
    if (order.totalAmount != null) return formatMoney(order.totalAmount)
    if (order.total != null) return formatMoney(order.total)
    if (order.total_amount != null) return formatMoney(order.total_amount)
    return formatMoney(computeItemsTotal(order.items))
  })()

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl"
        onClick={() => setShowDetails(true)}
      >
        <div className="border-b border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#fff7ed_100%)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-black tracking-tight text-slate-900">
                  Order #{displayNumber ?? order.orderNumber ?? order.order_number ?? order.number ?? order.id ?? ''}
                </h3>
                <OrderPriorityBadge priority={order.priority} />
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate">{order.customerName ?? order.customer?.name ?? 'Guest'}</span>
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate">Table {order.tableNumber ?? order.table_number ?? order.table?.number ?? ''}</span>
              </div>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-white p-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-500">Items</span>
              <span className="font-semibold text-slate-900">{order.itemCount ?? order.items?.length ?? 0} items</span>
            </div>
            <div className="mt-2 text-sm leading-6 text-slate-600 line-clamp-2">
              {Array.isArray(order.items) ? order.items.map((item) => item.name ?? item.title ?? '').filter(Boolean).join(', ') : ''}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
              <Clock className="h-3.5 w-3.5" />
              {getTimeElapsed(order.createdAt)}
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Total</div>
              <div className="text-lg font-black text-orange-600">Br {displayTotal}</div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Eye className="h-4 w-4 text-slate-400" />
              Tap to open
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition group-hover:shadow-sm">
              Details
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </motion.div>

      {showDetails && (
        <OrderDetailsModal
          order={order}
          displayNumber={displayNumber}
          onClose={() => setShowDetails(false)}
          onRefresh={onRefresh}
        />
      )}
    </>
  )
}

export default WaiterOrderCard