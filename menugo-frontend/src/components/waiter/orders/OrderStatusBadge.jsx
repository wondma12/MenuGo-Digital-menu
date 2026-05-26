import React from 'react'
import * as Icons from 'lucide-react'

const DefaultIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="6" />
  </svg>
)

const OrderStatusBadge = ({ status, size = 'sm' }) => {
  const config = {
    pending: { label: 'Pending', icon: Icons.Clock || DefaultIcon, color: 'bg-orange-50 text-orange-700 ring-1 ring-orange-100' },
    verified: { label: 'Verified', icon: Icons.CheckCircle || DefaultIcon, color: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' },
    preparing: { label: 'Preparing', icon: Icons.Activity || DefaultIcon, color: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100' },
    ready: { label: 'Ready', icon: Icons.Truck || Icons.Package || DefaultIcon, color: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' },
    completed: { label: 'Completed', icon: Icons.CheckCircle || DefaultIcon, color: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' }
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  }

  const { label, icon: Icon, color } = config[status] || config.pending

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${color} ${sizeClasses[size]}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

export default OrderStatusBadge