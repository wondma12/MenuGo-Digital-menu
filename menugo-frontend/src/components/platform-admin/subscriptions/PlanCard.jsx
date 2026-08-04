import React from 'react'
import { CheckIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'

const PlanCard = ({ plan, onEdit, onDelete }) => {
  const badgeVariants = {
    monthly: 'primary',
    six_month: 'purple',
    yearly: 'warning',
  }

  const tierLabels = {
    monthly: 'Monthly',
    six_month: '6-Month',
    yearly: 'Yearly',
  }

  const normalizeFeatures = (features) => {
    if (!features) return []
    if (Array.isArray(features)) return features
    if (typeof features === 'string') {
      try {
        const { safeParseJSON } = require('../../../utils/helpers')
        const parsed = safeParseJSON(features)
        if (Array.isArray(parsed)) return parsed
      } catch (e) {
        // ignore
      }
      return features.split(',').map(f => f.trim()).filter(Boolean)
    }
    if (typeof features === 'object') {
      const vals = Object.values(features).filter(v => v !== null && v !== undefined)
      return vals.map(v => (typeof v === 'string' ? v : String(v)))
    }
    return []
  }

  const getPriceDisplay = () => {
    if (plan.tier === 'monthly') {
      return `ETB ${plan.price_monthly || plan.priceMonthly}/month`
    } else if (plan.tier === 'six_month') {
      return `ETB ${plan.price_yearly || plan.priceYearly}/6 months`
    } else if (plan.tier === 'yearly') {
      return `ETB ${plan.price_yearly || plan.priceYearly}/year`
    }
    return 'N/A'
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-none border border-slate-100 border-l-4 border-l-slate-100 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="flex-1 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-black capitalize tracking-tight text-slate-900">{plan.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
          </div>
          <Badge variant={badgeVariants[plan.tier]} size="md" className="rounded-none">
            {tierLabels[plan.tier]}
          </Badge>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{getPriceDisplay()}</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {normalizeFeatures(plan.features).map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm text-slate-600">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-orange-100 px-6 py-4">
        <div className="flex gap-2">
          <button onClick={onEdit} className="flex flex-1 items-center justify-center gap-2 rounded-none px-3 py-2 text-sm text-slate-600 hover:bg-orange-50">
            <PencilIcon className="w-4 h-4" />
            Edit
          </button>
          <button onClick={onDelete} className="flex flex-1 items-center justify-center gap-2 rounded-none px-3 py-2 text-sm text-rose-600 hover:bg-rose-50">
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlanCard