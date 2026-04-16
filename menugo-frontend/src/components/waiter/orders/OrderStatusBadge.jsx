import React from 'react'
import * as Icons from 'lucide-react'

const DefaultIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="6" />
  </svg>
)

const OrderStatusBadge = ({ status, size = 'sm' }) => {
  const config = {
    pending: { label: 'Pending', icon: Icons.Clock || DefaultIcon, color: 'bg-yellow-100 text-yellow-800' },
    verified: { label: 'Verified', icon: Icons.CheckCircle || DefaultIcon, color: 'bg-blue-100 text-blue-800' },
    preparing: { label: 'Preparing', icon: Icons.Fire || Icons.Activity || DefaultIcon, color: 'bg-orange-100 text-orange-800' },
    ready: { label: 'Ready', icon: Icons.Truck || Icons.Package || DefaultIcon, color: 'bg-purple-100 text-purple-800' },
    served: { label: 'Served', icon: Icons.Star || DefaultIcon, color: 'bg-green-100 text-green-800' }
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