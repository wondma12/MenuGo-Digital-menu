import React from 'react'

const TableStatusBadge = ({ status, size = 'md', showIcon = true }) => {
  const config = {
    available: {
      label: 'Available',
      color: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
      dotColor: 'bg-emerald-500',
      icon: '●'
    },
    occupied: {
      label: 'Occupied',
      color: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
      dotColor: 'bg-rose-500',
      icon: '●'
    },
    reserved: {
      label: 'Reserved',
      color: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
      dotColor: 'bg-amber-500',
      icon: '●'
    },
    cleaning: {
      label: 'Cleaning',
      color: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
      dotColor: 'bg-blue-500',
      icon: '●'
    },
    maintenance: {
      label: 'Maintenance',
      color: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
      dotColor: 'bg-slate-500',
      icon: '●'
    }
  }

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  }

  const { label, color, dotColor, icon } = config[status] || config.available

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${color} ${sizeClasses[size]}`}>
      {showIcon && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {showIcon && icon}
      {label}
    </span>
  )
}

export default TableStatusBadge