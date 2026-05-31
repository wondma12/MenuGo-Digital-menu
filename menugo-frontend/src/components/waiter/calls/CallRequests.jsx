import React from 'react'
import { useQuery } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import CallCard from './CallCard'
import CallDetails from './CallDetails'
import { BellRing, Phone } from 'lucide-react'
import Loading from '../../common/Loading'
import { getWaiterCalls } from '../../../services/callService'

const CallRequests = () => {
  const [selectedCall, setSelectedCall] = React.useState(null)
  const [activeFilter, setActiveFilter] = React.useState('all')

  const { data: calls, isLoading, refetch } = useQuery('waiterCalls', getWaiterCalls, {
    refetchInterval: 5000
  })

  if (isLoading) return <Loading />

  const safeCalls = Array.isArray(calls) ? calls : []
  const totalCalls = safeCalls.length
  const pendingCount = safeCalls.filter(c => c.status === 'pending').length

  const statusOrder = {
    pending: 0,
    acknowledged: 1,
    resolved: 2,
  }

  const sortedCalls = [...safeCalls].sort((a, b) => {
    const rankA = statusOrder[a.status] ?? 99
    const rankB = statusOrder[b.status] ?? 99
    if (rankA !== rankB) return rankA - rankB

    const timeA = new Date(a.createdAt || 0).getTime()
    const timeB = new Date(b.createdAt || 0).getTime()
    return timeB - timeA
  })

  const filteredCalls = activeFilter === 'all'
    ? sortedCalls
    : sortedCalls.filter((call) => call.status === activeFilter)

  const filterItems = [
    { key: 'all', label: 'All', count: totalCalls },
    { key: 'pending', label: 'Pending', count: safeCalls.filter(c => c.status === 'pending').length },
    { key: 'acknowledged', label: 'Acknowledged', count: safeCalls.filter(c => c.status === 'acknowledged').length },
    { key: 'resolved', label: 'Resolved', count: safeCalls.filter(c => c.status === 'resolved').length },
  ]

  return (
    <div className="relative space-y-6 overflow-visible bg-white p-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),transparent_32%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6 overflow-visible">
        <div className="relative z-20 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-orange-600">Waiter workspace</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Call Requests</h1>
            <p className="max-w-2xl text-sm text-slate-500 sm:text-base">Monitor table requests, acknowledge them quickly, and keep the floor moving.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <BellRing className="h-4 w-4 text-orange-500" />
            {totalCalls} calls live
          </div>
        </div>

        
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {sortedCalls.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-orange-100 bg-gradient-to-br from-white to-orange-50/40 px-4 py-12 text-center shadow-sm sm:px-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <Phone className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No call requests</h3>
            <p className="mt-1 text-sm text-slate-500">Customer calls will appear here in real time.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <section className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {filterItems.map((item) => {
                  const isActive = activeFilter === item.key
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveFilter(item.key)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        isActive
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-500'}`}>
                        {item.count}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700 sm:text-base">Call List</h3>
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700 ring-1 ring-orange-100">
                  {pendingCount} waiting
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="hidden grid-cols-[1.1fr_1fr_1fr_auto] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:grid">
                  <span>Table</span>
                  <span>Request</span>
                  <span>Time</span>
                  <span>Status</span>
                </div>

                <AnimatePresence>
                  {filteredCalls.map((call) => (
                    <motion.div
                      key={call.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                    >
                      <CallCard call={call} onClick={() => setSelectedCall(call)} onRefresh={refetch} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredCalls.length === 0 && (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">
                    No calls found for the selected filter.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {selectedCall && (
        <CallDetails
          isOpen={!!selectedCall}
          onClose={() => setSelectedCall(null)}
          call={selectedCall}
          onRefresh={refetch}
        />
      )}
    </div>
  )
}

export default CallRequests