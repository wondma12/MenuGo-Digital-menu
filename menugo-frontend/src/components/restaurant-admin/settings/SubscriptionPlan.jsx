import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import { CheckIcon } from '@heroicons/react/24/outline'
import Button from '../../../common/Button'
import Badge from '../../../common/Badge'
import Loading from '../../../common/Loading'
import toast from 'react-hot-toast'
import { getCurrentSubscription, getAvailablePlans } from '../../../services/subscriptionService'
import { createSupportTicket, updateTicketStatus } from '../../../services/supportService'
import { useAuthStore } from '../../../store/authStore'

const SubscriptionPlan = ({ settings }) => {
  const restaurantId = useAuthStore((state) => state.user?.restaurant?.id || state.user?.restaurant_id || state.user?.restaurant?._id)
  const [requestedPlanId, setRequestedPlanId] = useState(null)
  const [requestedTicketId, setRequestedTicketId] = useState(null)

  const fallbackSubscription = {
    tier: settings?.subscription_tier || settings?.subscriptionTier || 'monthly',
    name: settings?.subscription_name || settings?.subscriptionName || settings?.subscription_tier || settings?.subscriptionTier || 'Monthly Plan',
    billingCycle: settings?.billing_cycle || settings?.billingCycle || settings?.subscription_tier || settings?.subscriptionTier || 'monthly',
    price: settings?.price_monthly || settings?.priceMonthly || 0,
    nextBillingDate: settings?.subscription_end_date || settings?.subscriptionEndDate || null,
  }

  const { data: currentPlan, isLoading: planLoading } = useQuery('currentSubscription', getCurrentSubscription, {
    initialData: () => fallbackSubscription,
  })
  const { data: availablePlans, isLoading: plansLoading } = useQuery('availablePlans', getAvailablePlans)

  const getPlanKey = (plan) => {
    if (!plan) return null
    return plan.id || plan.tier || plan.name || `${plan.price || plan.priceMonthly || plan.price_monthly || 'unknown'}-${plan.tier || plan.name}`
  }

  const upgradeMutation = useMutation(
    async ({ plan }) => {
      return createSupportTicket({
        restaurant_id: restaurantId,
        subject: `Subscription upgrade request: ${plan.name || plan.tier}`,
        description: `Please review and approve the subscription upgrade request for restaurant ${currentPlan?.name || 'current restaurant'} to the ${plan.name || plan.tier} plan. Requested tier: ${plan.tier || plan.name}. Current plan: ${currentPlan?.name || currentPlan?.tier || 'unknown'}, billing cycle: ${currentPlan?.billingCycle || currentPlan?.billing_cycle || 'monthly'}.`,
        priority: 'high',
        category: 'billing',
      })
    },
    {
      onSuccess: (data, variables) => {
        // `data` should be the created ticket object from the API
        const ticket = data || {}
        setRequestedPlanId(getPlanKey(variables.plan))
        if (ticket.id) setRequestedTicketId(ticket.id)
        toast.success('Upgrade request sent to platform admin for verification')
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to send upgrade request')
      },
    }
  )

  const cancelMutation = useMutation(
    async ({ ticketId }) => updateTicketStatus({ ticketId, status: 'closed' }),
    {
      onSuccess: () => {
        setRequestedTicketId(null)
        setRequestedPlanId(null)
        toast.success('Upgrade request cancelled')
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || 'Failed to cancel upgrade request')
      },
    }
  )

  if (planLoading || plansLoading) return <Loading />

  const getTierColor = (tier) => {
    const colors = {
      basic: 'blue',
      premium: 'purple',
      enterprise: 'gold',
      monthly: 'blue',
      six_month: 'purple',
      yearly: 'gold',
    }
    return colors[tier] || 'default'
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'Contact us'
    return `ETB ${Number(amount).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 })}`
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    try {
      const d = new Date(date)
      if (d.getTime() === new Date('1970-01-01').getTime() || isNaN(d.getTime())) {
        return 'N/A'
      }
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch (e) {
      return 'N/A'
    }
  }

  const normalizeFeatures = (features) => {
    if (!features) return []
    if (Array.isArray(features)) return features
    if (typeof features === 'string') {
      try {
        const parsed = JSON.parse(features)
        if (Array.isArray(parsed)) return parsed
      } catch (e) {
        // ignore
      }
      return features.split(',').map((item) => item.trim()).filter(Boolean)
    }
    if (typeof features === 'object') {
      return Object.values(features)
        .filter((value) => value !== null && value !== undefined)
        .map((value) => (typeof value === 'string' ? value : String(value)))
    }
    return []
  }

  // Get the correct price property
  const getCurrentPrice = (plan) => {
    const candidates = [plan?.price, plan?.priceMonthly, plan?.price_monthly, plan?.monthlyPrice]
    for (const value of candidates) {
      if (value === null || value === undefined || value === '') continue
      const numericValue = Number(value)
      if (!Number.isNaN(numericValue)) return numericValue
    }
    return 0
  }

  const getYearlyPrice = (plan) => {
    return plan?.priceYearly || plan?.price_yearly || (getCurrentPrice(plan) * 12) || 0
  }

  const getMonthlyPrice = (plan) => {
    return getCurrentPrice(plan)
  }

  const getCurrentPlanPrice = () => {
    const currentPrice = getMonthlyPrice(currentPlan)
    if (currentPrice > 0) return currentPrice

    const matchingPlan = availablePlans?.find((plan) => {
      const planKey = getPlanKey(plan)
      const currentPlanKey = getPlanKey(currentPlan)
      return planKey && currentPlanKey && planKey === currentPlanKey
    }) || availablePlans?.find((plan) => {
      const normalizedPlanTier = (plan?.tier || '').toString().toLowerCase()
      const normalizedCurrentTier = (currentPlan?.tier || '').toString().toLowerCase()
      return normalizedPlanTier && normalizedCurrentTier && normalizedPlanTier === normalizedCurrentTier
    })

    return getMonthlyPrice(matchingPlan)
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
            <p className="font-semibold text-slate-900">{currentPlan?.name || currentPlan?.tier}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Billing Cycle</p>
            <p className="font-semibold text-slate-900">{currentPlan?.billingCycle || currentPlan?.billing_cycle || 'monthly'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Price</p>
            <p className="font-semibold text-slate-900">
              {formatCurrency(getCurrentPlanPrice())}
              <span className="text-base font-medium text-slate-500">/month</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Next Billing</p>
            <p className="font-semibold text-slate-900">{formatDate(currentPlan?.nextBillingDate)}</p>
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
                <span className="text-3xl font-bold text-slate-900">{formatCurrency(getMonthlyPrice(plan))}</span>
                <span className="text-slate-500">/month</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">or {formatCurrency(getYearlyPrice(plan))}/year</p>
              <div className="mt-4 space-y-2">
                {normalizeFeatures(plan.features).slice(0, 5).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    <span className="text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>
              <Button
                className={`w-full mt-6 ${currentPlan?.tier === plan.tier ? '' : 'rounded-none bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-orange-600'}`}
                variant={currentPlan?.tier === plan.tier ? 'outline' : 'primary'}
                disabled={currentPlan?.tier === plan.tier || upgradeMutation.isLoading || requestedPlanId === getPlanKey(plan)}
                onClick={() => {
                  if (currentPlan?.tier === plan.tier) return
                  upgradeMutation.mutate({ plan })
                }}
              >
                {currentPlan?.tier === plan.tier ? 'Current Plan' : requestedPlanId === getPlanKey(plan) ? 'Request Sent' : 'Upgrade'}
              </Button>
              {requestedPlanId === getPlanKey(plan) && (
                <div className="mt-3">
                  <p className="text-sm text-emerald-600">Upgrade request is pending review by platform admin.</p>
                  {requestedTicketId && (
                    <div className="mt-2 flex gap-2">
                      <Button
                        className="w-full"
                        variant="outline"
                        disabled={cancelMutation.isLoading}
                        onClick={() => cancelMutation.mutate({ ticketId: requestedTicketId })}
                      >
                        {cancelMutation.isLoading ? 'Cancelling...' : 'Cancel Upgrade'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPlan