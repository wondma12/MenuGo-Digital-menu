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
      color: 'bg-yellow-100 text-yellow-800',
      dotColor: 'bg-yellow-500',
    },
    verified: {
      label: 'Verified',
      icon: CheckCircleIcon,
      color: 'bg-blue-100 text-blue-800',
      dotColor: 'bg-blue-500',
    },
    preparing: {
      label: 'Preparing',
      icon: FireIcon,
      color: 'bg-orange-100 text-orange-800',
      dotColor: 'bg-orange-500',
    },
    ready: {
      label: 'Ready',
      icon: TruckIcon,
      color: 'bg-purple-100 text-purple-800',
      dotColor: 'bg-purple-500',
    },
    served: {
      label: 'Served',
      icon: SparklesIcon,
      color: 'bg-green-100 text-green-800',
      dotColor: 'bg-green-500',
    },
    completed: {
      label: 'Completed',
      icon: CheckCircleIcon,
      color: 'bg-green-100 text-green-800',
      dotColor: 'bg-green-500',
    },
    cancelled: {
      label: 'Cancelled',
      icon: XCircleIcon,
      color: 'bg-red-100 text-red-800',
      dotColor: 'bg-red-500',
    },
    rejected: {
      label: 'Rejected',
      icon: XCircleIcon,
      color: 'bg-red-100 text-red-800',
      dotColor: 'bg-red-500',
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
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${color} ${sizeClasses[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
      <IconComponent className="w-3 h-3" />
      {label}
    </span>
  )
}

export default OrderStatusBadge