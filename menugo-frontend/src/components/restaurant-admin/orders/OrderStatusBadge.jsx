import React from 'react'
import {
  ClockIcon,
  CheckCircleIcon,
  FireIcon,
  TruckIcon,
  SparklesIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

const OrderStatusBadge = ({ status, size = 'sm' }) => {
  const config = {
    pending: {
      label: 'Pending',
      icon: ClockIcon,
      color: 'bg-orange-50 text-orange-700',
      dotColor: 'bg-orange-500',
    },
    verified: {
      label: 'Verified',
      icon: CheckCircleIcon,
      color: 'bg-sky-50 text-sky-700',
      dotColor: 'bg-sky-500',
    },
    preparing: {
      label: 'Preparing',
      icon: FireIcon,
      color: 'bg-orange-50 text-orange-700',
      dotColor: 'bg-orange-500',
    },
    ready: {
      label: 'Ready',
      icon: TruckIcon,
      color: 'bg-blue-50 text-blue-700',
      dotColor: 'bg-blue-500',
    },
    served: {
      label: 'Served',
      icon: SparklesIcon,
      color: 'bg-emerald-50 text-emerald-700',
      dotColor: 'bg-emerald-500',
    },
    completed: {
      label: 'Completed',
      icon: CheckCircleIcon,
      color: 'bg-emerald-50 text-emerald-700',
      dotColor: 'bg-emerald-500',
    },
    cancelled: {
      label: 'Cancelled',
      icon: XCircleIcon,
      color: 'bg-rose-50 text-rose-700',
      dotColor: 'bg-rose-500',
    },
    rejected: {
      label: 'Rejected',
      icon: XCircleIcon,
      color: 'bg-rose-50 text-rose-700',
      dotColor: 'bg-rose-500',
    },
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  const { label, icon: Icon, color, dotColor } = config[status] || config.pending
  const IconComponent = Icon

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-none font-medium ${color} ${sizeClasses[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
      <IconComponent className="w-3 h-3" />
      {label}
    </span>
  )
}

export default OrderStatusBadge