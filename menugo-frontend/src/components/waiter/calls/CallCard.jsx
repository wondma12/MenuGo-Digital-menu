import React from 'react'
import { motion } from 'framer-motion'
import { Bell, CreditCard, HelpCircle, Coffee, MessageSquare, ChevronRight } from 'lucide-react'

const CallCard = ({ call, onClick }) => {
  const getCallTypeIcon = (type) => {
    const icons = {
      service: <Bell className="w-6 h-6" />, 
      bill: <CreditCard className="w-6 h-6" />,
      help: <HelpCircle className="w-6 h-6" />,
      food_issue: <Coffee className="w-6 h-6" />,
      other: <MessageSquare className="w-6 h-6" />
    }
    return icons[type] || <Bell className="w-6 h-6" />
  }

  const getCallTypeLabel = (type) => {
    const labels = {
      service: 'Service Request',
      bill: 'Bill Request',
      help: 'Help',
      food_issue: 'Food Issue',
      other: 'Other'
    }
    return labels[type] || 'Call'
  }

  const getTimeElapsed = (createdAt) => {
    const createdTime = createdAt ? new Date(createdAt).getTime() : NaN
    if (!Number.isFinite(createdTime)) return 'Unknown time'

    const diffMs = Date.now() - createdTime
    if (diffMs <= 0) return 'Just now'

    const totalMinutes = Math.floor(diffMs / 60000)
    if (totalMinutes < 1) return 'Just now'
    if (totalMinutes < 60) return `${totalMinutes}m ago`

    const totalHours = Math.floor(totalMinutes / 60)
    if (totalHours < 24) {
      const remMinutes = totalMinutes % 60
      return remMinutes > 0 ? `${totalHours}h ${remMinutes}m ago` : `${totalHours}h ago`
    }

    const days = Math.floor(totalHours / 24)
    const remHours = totalHours % 24
    return remHours > 0 ? `${days}d ${remHours}h ago` : `${days}d ago`
  }

  const isPending = call.status === 'pending'

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(248,250,252,0.65)' }}
      onClick={onClick}
      className={`group cursor-pointer border-b border-slate-100 px-4 py-3 transition-all duration-150 last:border-b-0 hover:bg-slate-50 ${
        isPending ? 'bg-orange-50/35' : 'bg-white'
      }`}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_1fr_0.9fr_0.8fr_auto] sm:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            isPending ? 'bg-gradient-to-br from-orange-500 to-blue-500 text-white' : 'bg-gradient-to-br from-slate-100 to-white text-slate-600'
          }`}>
          {getCallTypeIcon(call.callType)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-black tracking-tight text-slate-900 sm:text-base">Table {call.tableNumber || '-'}</h3>
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-700 ring-1 ring-orange-100">
                {call.section || 'Main Hall'}
              </span>
            </div>
            {call.notes && (
              <p className="mt-1 line-clamp-1 text-xs text-slate-500">{call.notes}</p>
            )}
          </div>
        </div>

        <div className="text-sm font-semibold text-slate-700 sm:text-[13px]">
          {getCallTypeLabel(call.callType)}
        </div>

        <div className="text-[12px] font-medium text-slate-500 sm:text-[13px]">
          {getTimeElapsed(call.createdAt)}
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="flex items-center gap-2">
            {isPending && (
              <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500 shadow-[0_0_0_6px_rgba(249,115,22,0.10)]" />
            )}
            {isPending ? (
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700 ring-1 ring-orange-100">Pending</span>
            ) : call.status === 'acknowledged' ? (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">Acknowledged</span>
            ) : (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">Resolved</span>
            )}
          </div>
          <div className="hidden items-center gap-1.5 text-[11px] font-semibold text-orange-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-orange-700 sm:flex">
            Open
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CallCard