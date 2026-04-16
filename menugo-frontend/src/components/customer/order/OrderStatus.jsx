import React from 'react'

const OrderStatus = ({ status }) => {
  const config = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    verified: { label: 'Verified', color: 'bg-blue-100 text-blue-800', icon: '✅' },
    preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-800', icon: '🔪' },
    ready: { label: 'Ready', color: 'bg-purple-100 text-purple-800', icon: '🍽️' },
    served: { label: 'Served', color: 'bg-green-100 text-green-800', icon: '✨' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: '🎉' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' }
  }

  const { label, color, icon } = config[status] || config.pending

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${color}`}>
      <span>{icon}</span>
      {label}
    </span>
  )
}

export default OrderStatus