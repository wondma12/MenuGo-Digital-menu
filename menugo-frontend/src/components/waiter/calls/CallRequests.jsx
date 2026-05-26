import React from 'react'
import { useQuery } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import CallCard from './CallCard'
import CallDetails from './CallDetails'
import { BellRing, Phone, CheckCircle2, Clock3, AlertTriangle } from 'lucide-react'
import Loading from '../../common/Loading'
import { getWaiterCalls } from '../../../services/callService'

const CallRequests = () => {
  const [selectedCall, setSelectedCall] = React.useState(null)

  const { data: calls, isLoading, refetch } = useQuery('waiterCalls', getWaiterCalls, {
    refetchInterval: 5000
  })

  if (isLoading) return <Loading />

  const pendingCalls = calls?.filter(c => c.status === 'pending') || []
  const acknowledgedCalls = calls?.filter(c => c.status === 'acknowledged') || []
  const resolvedCalls = calls?.filter(c => c.status === 'resolved') || []
  const totalCalls = calls?.length || 0

  return (
    <div className="space-y-5 rounded-3xl border border-orange-100 bg-gradient-to-br from-white to-orange-50/30 p-3.5 shadow-sm sm:p-4 lg:p-5">
      <div className="rounded-3xl bg-[linear-gradient(135deg,rgba(249,115,22,0.14),rgba(59,130,246,0.08))] p-4 ring-1 ring-orange-100 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 shadow-sm ring-1 ring-orange-100">
              <BellRing className="h-3.5 w-3.5" />
              Live call queue
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">Call Requests</h2>
              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-600 sm:text-sm">
                Monitor table requests, acknowledge them quickly, and keep the floor moving.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:min-w-[320px] sm:grid-cols-4">
            <div className="rounded-2xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-orange-100">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                <Phone className="h-3.5 w-3.5 text-orange-400" />
                Total
              </div>
              <p className="mt-1 text-lg font-black text-slate-900">{totalCalls}</p>
            </div>
            <div className="rounded-2xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-orange-100">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                Pending
              </div>
              <p className="mt-1 text-lg font-black text-rose-600">{pendingCalls.length}</p>
            </div>
            <div className="rounded-2xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-orange-100">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                <Clock3 className="h-3.5 w-3.5 text-blue-500" />
                Active
              </div>
              <p className="mt-1 text-lg font-black text-blue-600">{acknowledgedCalls.length}</p>
            </div>
            <div className="rounded-2xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-orange-100">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Resolved
              </div>
              <p className="mt-1 text-lg font-black text-emerald-600">{resolvedCalls.length}</p>
            </div>
          </div>
        </div>
      </div>

      {calls?.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-orange-100 bg-gradient-to-br from-white to-orange-50/40 px-4 py-12 text-center shadow-sm sm:px-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-500">
            <Phone className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No call requests</h3>
          <p className="mt-1 text-sm text-slate-500">Customer calls will appear here in real time.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {pendingCalls.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-orange-500 shadow-[0_0_0_6px_rgba(249,115,22,0.12)]" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700 sm:text-base">Pending Calls</h3>
                </div>
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700 ring-1 ring-orange-100">
                  {pendingCalls.length} waiting
                </span>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {pendingCalls.map((call) => (
                    <motion.div
                      key={call.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CallCard call={call} onClick={() => setSelectedCall(call)} onRefresh={refetch} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {acknowledgedCalls.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700 sm:text-base">Acknowledged</h3>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">
                  {acknowledgedCalls.length} active
                </span>
              </div>
              <div className="space-y-3">
                {acknowledgedCalls.map((call) => (
                  <CallCard key={call.id} call={call} onClick={() => setSelectedCall(call)} onRefresh={refetch} />
                ))}
              </div>
            </section>
          )}

          {resolvedCalls.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700 sm:text-base">Recent Resolved</h3>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  Showing {Math.min(resolvedCalls.length, 5)}
                </span>
              </div>
              <div className="space-y-3">
                {resolvedCalls.slice(0, 5).map((call) => (
                  <CallCard key={call.id} call={call} onClick={() => setSelectedCall(call)} onRefresh={refetch} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

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