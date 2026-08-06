

const OrderPriorityBadge = ({ priority }) => {
  if (!priority || priority === 'normal') return null

  const config = {
    high: { label: 'High Priority', color: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100' },
    low: { label: 'Low Priority', color: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' }
  }

  const { label, color } = config[priority] || {}

  return (
    <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${color}`}>
      {label}
    </span>
  )
}

export default OrderPriorityBadge