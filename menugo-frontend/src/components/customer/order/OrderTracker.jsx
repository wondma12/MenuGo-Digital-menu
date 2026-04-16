import React from 'react'
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

const OrderTracker = ({ order }) => {
  const steps = [
    { key: 'pending', label: 'Order Placed', icon: '📝' },
    { key: 'verified', label: 'Verified', icon: '✅' },
    { key: 'preparing', label: 'Preparing', icon: '🔪' },
    { key: 'ready', label: 'Ready', icon: '🍽️' },
    { key: 'served', label: 'Served', icon: '✨' }
  ]

  const getStepStatus = (stepKey) => {
    const stepIndex = steps.findIndex(s => s.key === stepKey)
    const currentIndex = steps.findIndex(s => s.key === order.status)
    
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'pending'
  }

  return (
    <div className="bg-white rounded-xl p-6 mb-6">
      <div className="relative">
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200" />
        
        <div className="space-y-6 relative">
          {steps.map((step, index) => {
            const status = getStepStatus(step.key)
            
            return (
              <div key={step.key} className="flex items-start gap-3">
                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                  status === 'completed' ? 'bg-green-100' :
                  status === 'current' ? 'bg-primary-100 animate-pulse' : 'bg-gray-100'
                }`}>
                  {status === 'completed' ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <span className="text-xl">{step.icon}</span>
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <p className={`font-medium ${
                    status === 'completed' ? 'text-gray-900' :
                    status === 'current' ? 'text-primary-700' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  {status === 'current' && (
                    <p className="text-xs text-primary-600 mt-1">In progress...</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default OrderTracker