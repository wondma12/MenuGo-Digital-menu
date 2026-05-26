import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, DollarSign, Star, TrendingUp } from 'lucide-react'
import { formatPrice } from '../../../utils/currency'

const WaiterStats = ({ stats }) => {
  const colorMap = {
    blue: {
      accent: 'from-blue-500 to-blue-400',
      bar: 'from-blue-500 to-blue-400'
    },
    emerald: {
      accent: 'from-emerald-500 to-emerald-400',
      bar: 'from-emerald-500 to-emerald-400'
    },
    amber: {
      accent: 'from-orange-500 to-amber-400',
      bar: 'from-orange-500 to-amber-400'
    },
    violet: {
      accent: 'from-slate-700 to-slate-500',
      bar: 'from-slate-700 to-slate-500'
    }
  }

  const statCards = [
    {
      title: 'Active Orders',
      value: stats?.activeOrders || 0,
      icon: ShoppingBag,
      color: 'blue',
      change: stats?.ordersChange
    },
    {
      title: 'Today\'s Revenue',
      value: formatPrice(stats?.todayRevenue || 0),
      icon: null,
      color: 'emerald',
      change: stats?.revenueChange
    },
    {
      title: 'Today\'s Tips',
      value: formatPrice(stats?.todayTips || 0),
      icon: null,
      color: 'amber',
      change: stats?.tipsChange
    },
    {
      title: 'Customer Rating',
      value: `${stats?.rating || 0}/5`,
      icon: Star,
      color: 'violet',
      change: stats?.ratingChange
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
          className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-3 pl-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl sm:p-3 sm:pl-6"
        >
          <div className={`absolute inset-y-0 left-0 w-1 rounded-l-3xl bg-gradient-to-b ${colorMap[stat.color]?.bar || colorMap.blue.bar}`} />
          <div className="flex items-start justify-between gap-2">
            {stat.icon ? (
              <div className={`rounded-2xl bg-gradient-to-r ${colorMap[stat.color]?.accent || colorMap.blue.accent} p-2 text-white shadow-sm`}>
                <stat.icon className="h-4 w-4" />
              </div>
            ) : (
              <div className={`rounded-2xl bg-gradient-to-r ${colorMap[stat.color]?.accent || colorMap.blue.accent} p-2`} />
            )}
            {stat.change !== undefined && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${stat.change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                <TrendingUp className="h-2.5 w-2.5" />
                {stat.change >= 0 ? '+' : ''}{stat.change}%
              </span>
            )}
          </div>
          <p className="mt-2 text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">{stat.value}</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 sm:text-[11px]">{stat.title}</p>
        </motion.div>
      ))}
    </div>
  )
}

export default WaiterStats