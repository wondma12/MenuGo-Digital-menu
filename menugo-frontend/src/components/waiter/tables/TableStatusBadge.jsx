import React from 'react'

const TableStatusBadge = ({ status, size = 'md', showIcon = true }) => {
  const config = {
    available: {
      label: 'Available',
      color: 'bg-green-100 text-green-700',
      dotColor: 'bg-green-500',
      icon: '🟢'
    },
    occupied: {
      label: 'Occupied',
      color: 'bg-red-100 text-red-700',
      dotColor: 'bg-red-500',
      icon: '🔴'
    },
    reserved: {
      label: 'Reserved',
      color: 'bg-yellow-100 text-yellow-700',
      dotColor: 'bg-yellow-500',
      icon: '🟡'
    },
    cleaning: {
      label: 'Cleaning',
      color: 'bg-blue-100 text-blue-700',
      dotColor: 'bg-blue-500',
      icon: '🔵'
    },
    maintenance: {
      label: 'Maintenance',
      color: 'bg-gray-100 text-gray-600',
      dotColor: 'bg-gray-500',
      icon: '⚙️'
    }
  }

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  }

  const { label, color, dotColor, icon } = config[status] || config.available

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${color} ${sizeClasses[size]}`}>
      {showIcon && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {showIcon && icon}
      {label}
    </span>
  )
}

export default TableStatusBadge