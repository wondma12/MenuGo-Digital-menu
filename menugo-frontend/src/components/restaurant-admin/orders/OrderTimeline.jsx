import React from 'react'
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

const OrderTimeline = ({ order }) => {
  const steps = [
    { key: 'created', label: 'Order Placed', time: order.createdAt, icon: '📝' },
    { key: 'verified', label: 'Verified', time: order.verifiedAt, icon: '✅' },
    { key: 'preparing', label: 'Preparing', time: order.preparationStartedAt, icon: '🔪' },
    { key: 'ready', label: 'Ready', time: order.readyAt, icon: '🍽️' },
    { key: 'served', label: 'Served', time: order.servedAt, icon: '✨' },
    { key: 'completed', label: 'Completed', time: order.completedAt, icon: '🎉' },
  ]

  const getStepStatus = (stepTime, currentStep) => {
    if (stepTime) return 'completed'
    if (steps.find(s => s.key === currentStep)?.key === stepTime?.key) return 'current'
    return 'pending'
  }

  const currentStep = () => {
    if (order.completedAt) return 'completed'
    if (order.servedAt) return 'served'
    if (order.readyAt) return 'ready'
    if (order.preparationStartedAt) return 'preparing'
    if (order.verifiedAt) return 'verified'
    return 'created'
  }

  const activeStep = currentStep()
  const activeIndex = steps.findIndex(s => s.key === activeStep)

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-4">Order Timeline</h4>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gray-300" />
        
        <div className="space-y-4 relative">
          {steps.map((step, index) => {
            const status = getStepStatus(step.time, activeStep)
            const isCompleted = status === 'completed'
            const isCurrent = status === 'current' && index === activeIndex
            const isFuture = index > activeIndex

            return (
              <div key={step.key} className="flex items-start gap-3">
                <div className="relative z-10">
                  {isCompleted ? (
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center animate-pulse">
                      <span className="text-lg">{step.icon}</span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${isCompleted ? 'text-gray-900' : isCurrent ? 'text-primary-700' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {step.time && (
                      <p className="text-xs text-gray-500">
                        {new Date(step.time).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  {isCurrent && !step.time && (
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

export default OrderTimeline