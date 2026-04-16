import React from 'react'

const OrderPriorityBadge = ({ priority }) => {
  if (!priority || priority === 'normal') return null

  const config = {
    high: { label: 'High Priority', color: 'bg-red-100 text-red-800' },
    low: { label: 'Low Priority', color: 'bg-gray-100 text-gray-600' }
  }

  const { label, color } = config[priority] || {}

  return (
    <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}

export default OrderPriorityBadge