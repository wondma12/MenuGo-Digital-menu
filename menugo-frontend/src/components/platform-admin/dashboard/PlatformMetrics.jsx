
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline'
import { formatPrice } from '../../../utils/currency'

const MetricCard = ({ title, value, change, icon: Icon, color }) => {
  return (
    <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/70 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className={`rounded-xl bg-gradient-to-r ${color} p-1.5 text-white shadow-sm`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {change > 0 ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{title}</p>
    </div>
  )
}

const PlatformMetrics = ({ data }) => {
  const metrics = [
    { title: 'Avg Order Value', value: formatPrice(data.avgOrderValue || 0), change: data.avgOrderValueChange, icon: ChartBarIcon, color: 'from-blue-500 to-blue-400' },
    { title: 'Active Users', value: data.activeUsers?.toLocaleString() || 0, change: data.activeUsersChange, icon: UserGroupIcon, color: 'from-emerald-500 to-emerald-400' },
    { title: 'Conversion Rate', value: `${data.conversionRate || 0}%`, change: data.conversionRateChange, icon: ChartBarIcon, color: 'from-violet-500 to-violet-400' },
    { title: 'Retention Rate', value: `${data.retentionRate || 0}%`, change: data.retentionRateChange, icon: UserGroupIcon, color: 'from-orange-500 to-amber-400' },
  ]

  return (
    <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Performance</p>
        <h3 className="mt-1 text-lg font-black text-slate-900">Platform Metrics</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MetricCard {...metric} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default PlatformMetrics