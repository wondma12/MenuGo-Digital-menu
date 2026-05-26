import React from 'react'
import { motion } from 'framer-motion'
import { Bell, CreditCard, HelpCircle, Coffee, MessageSquare, ChevronRight } from 'lucide-react'

const CallCard = ({ call, onClick, onRefresh }) => {
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
    const minutes = Math.floor((new Date() - new Date(createdAt)) / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} min ago`
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`
  }

  const isPending = call.status === 'pending'

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.005 }}
      onClick={onClick}
      className={`group cursor-pointer rounded-3xl border bg-white p-3.5 shadow-sm transition-all duration-200 sm:p-4 ${
        isPending
          ? 'border-orange-100 ring-1 ring-orange-100 hover:shadow-[0_12px_30px_rgba(249,115,22,0.10)]'
          : 'border-slate-100 hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)]'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
          isPending ? 'bg-gradient-to-br from-orange-500 to-blue-500 text-white' : 'bg-gradient-to-br from-slate-100 to-white text-slate-600'
        }`}>
          {getCallTypeIcon(call.callType)}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-tight text-slate-900 sm:text-base">Table {call.tableNumber}</h3>
                <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-700 ring-1 ring-orange-100">
                  {call.section || 'Main Hall'}
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">{getCallTypeLabel(call.callType)}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 text-right">
              {isPending && (
                <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500 shadow-[0_0_0_6px_rgba(249,115,22,0.10)]" />
              )}
              <span className="text-[11px] font-medium text-slate-400">{getTimeElapsed(call.createdAt)}</span>
            </div>
          </div>
          {call.notes && (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600 sm:text-sm">{call.notes}</p>
          )}
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isPending ? (
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700 ring-1 ring-orange-100">Pending</span>
              ) : call.status === 'acknowledged' ? (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">Acknowledged</span>
              ) : (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">Resolved</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-orange-700">
              Open
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CallCard