import React from 'react'
import { useQuery } from 'react-query'
import { CheckIcon } from '@heroicons/react/24/outline'
import Button from '../../../common/Button'
import Badge from '../../../common/Badge'
import Loading from '../../../common/Loading'
import { getCurrentSubscription, getAvailablePlans } from '../../../services/subscriptionService'

const SubscriptionPlan = ({ settings }) => {
  const { data: currentPlan, isLoading: planLoading } = useQuery('currentSubscription', getCurrentSubscription)
  const { data: availablePlans, isLoading: plansLoading } = useQuery('availablePlans', getAvailablePlans)

  if (planLoading || plansLoading) return <Loading />

  const getTierColor = (tier) => {
    const colors = {
      basic: 'blue',
      premium: 'purple',
      enterprise: 'gold',
    }
    return colors[tier] || 'default'
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Current Plan</h3>
            <p className="text-sm text-slate-500">Your subscription details</p>
          </div>
          <Badge variant={getTierColor(currentPlan?.tier)} size="md">
            {currentPlan?.tier?.toUpperCase()}
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-slate-500">Plan</p>
            <p className="font-semibold text-slate-900">{currentPlan?.name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Billing Cycle</p>
            <p className="font-semibold text-slate-900">{currentPlan?.billingCycle}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Price</p>
            <p className="font-semibold text-slate-900">${currentPlan?.price}/month</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Next Billing</p>
            <p className="font-semibold text-slate-900">{new Date(currentPlan?.nextBillingDate).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Manage Subscription</Button>
          <Button variant="outline">View Invoices</Button>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePlans?.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-xl border-2 p-6 ${currentPlan?.tier === plan.tier ? 'border-primary-500' : 'border-slate-100'}`}>
              {currentPlan?.tier === plan.tier && (
                <div className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded-full inline-block mb-3">
                  Current Plan
                </div>
              )}
              <h3 className="text-xl font-bold text-slate-900 capitalize">{plan.tier}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-slate-900">${plan.priceMonthly}</span>
                <span className="text-slate-500">/month</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">or ${plan.priceYearly}/year</p>
              <div className="mt-4 space-y-2">
                {plan.features?.slice(0, 5).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    <span className="text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>
              <Button
                className="w-full mt-6"
                variant={currentPlan?.tier === plan.tier ? 'outline' : 'primary'}
                disabled={currentPlan?.tier === plan.tier}
              >
                {currentPlan?.tier === plan.tier ? 'Current Plan' : 'Upgrade'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPlan