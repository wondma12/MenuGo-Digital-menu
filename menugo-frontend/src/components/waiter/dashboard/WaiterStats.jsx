
import { motion } from 'framer-motion'
import { formatPrice } from '../../../utils/currency'

const WaiterStats = ({ stats }) => {
  const colorMap = {
    blue: {
      accent: 'from-blue-500 to-cyan-400',
      bar: 'from-blue-500 to-cyan-400'
    },
    emerald: {
      accent: 'from-emerald-500 to-teal-400',
      bar: 'from-emerald-500 to-teal-400'
    },
    amber: {
      accent: 'from-orange-500 to-amber-400',
      bar: 'from-orange-500 to-amber-400'
    },
    violet: {
      accent: 'from-violet-500 to-indigo-400',
      bar: 'from-violet-500 to-indigo-400'
    }
  }

  const statCards = [
    {
      title: 'Active Orders',
      value: stats?.activeOrders || 0,
      color: 'blue',
      change: stats?.ordersChange
    },
    {
      title: 'Today\'s Revenue',
      value: formatPrice(stats?.todayRevenue || 0),
      color: 'emerald',
      change: stats?.revenueChange
    },
    {
      title: 'Today\'s Tips',
      value: formatPrice(stats?.todayTips || 0),
      color: 'amber',
      change: stats?.tipsChange
    },
    {
      title: 'Customer Rating',
      value: `${stats?.rating || 0}/5`,
      color: 'violet',
      change: stats?.ratingChange
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: index * 0.08, duration: 0.35, ease: 'easeOut' }}
          whileHover={{ y: -3 }}
          className={`group relative flex h-24 items-center overflow-hidden rounded-2xl border border-slate-100 border-l-4 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-md ${stat.color === 'blue' ? 'border-l-blue-500' : stat.color === 'emerald' ? 'border-l-emerald-500' : stat.color === 'amber' ? 'border-l-amber-500' : 'border-l-violet-500'}`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.08),transparent_40%)] opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500">{stat.title}</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default WaiterStats