
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { FileText, Check, Activity, Star } from 'lucide-react'

const OrderTimeline = ({ order }) => {
  const steps = [
    { key: 'created', label: 'Order Placed', time: order.createdAt, icon: <FileText className="w-5 h-5" /> },
    { key: 'verified', label: 'Verified', time: order.verifiedAt, icon: <Check className="w-5 h-5" /> },
    { key: 'preparing', label: 'Preparing', time: order.preparationStartedAt, icon: <Activity className="w-5 h-5" /> },
    { key: 'ready', label: 'Ready', time: order.readyAt, icon: <Check className="w-5 h-5" /> },
    { key: 'served', label: 'Served', time: order.servedAt, icon: <Star className="w-5 h-5" /> },
    { key: 'completed', label: 'Completed', time: order.completedAt, icon: <Check className="w-5 h-5" /> },
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
    <div className="rounded-none bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <h4 className="mb-4 font-medium text-slate-900">Order Timeline</h4>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-slate-200" />
        
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-none bg-emerald-50">
                      <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                    </div>
                  ) : isCurrent ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-none bg-orange-50 animate-pulse">
                      <span className="text-lg">{step.icon}</span>
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-none bg-slate-100">
                      <ClockIcon className="h-5 w-5 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${isCompleted ? 'text-slate-900' : isCurrent ? 'text-orange-700' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                    {step.time && (
                      <p className="text-xs text-slate-500">
                        {new Date(step.time).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  {isCurrent && !step.time && (
                    <p className="mt-1 text-xs text-orange-600">In progress...</p>
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