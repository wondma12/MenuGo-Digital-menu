
import { motion } from 'framer-motion'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

const TodayMetrics = ({ metrics }) => {
  const colorMap = {
    green: 'bg-emerald-100 text-emerald-700',
    yellow: 'bg-amber-100 text-amber-700',
    red: 'bg-rose-100 text-rose-700'
  }

  const items = [
      {
      label: 'Completed Orders',
      value: metrics?.completedOrders || 0,
      icon: CheckCircle,
      color: 'green'
    },
    {
      label: 'Pending Verification',
      value: metrics?.pendingVerification || 0,
      icon: Clock,
      color: 'yellow'
    },
    {
      label: 'Rejected Orders',
      value: metrics?.rejectedOrders || 0,
      icon: XCircle,
      color: 'red'
    }
  ]

  return (
    <div className="rounded-3xl border border-orange-100 bg-white p-3 shadow-sm sm:p-4 md:p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Today</p>
          <h3 className="mt-1 text-base font-black text-slate-900 sm:text-lg">Today's Metrics</h3>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">A quick read on service progress and exceptions.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80 p-3 shadow-sm sm:p-3.5"
          >
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2 ${colorMap[item.color] || colorMap.green}`}>
                  <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700 sm:text-sm">{item.label}</span>
              </div>
              <span className="text-lg font-black text-slate-900 sm:text-xl">{item.value}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default TodayMetrics