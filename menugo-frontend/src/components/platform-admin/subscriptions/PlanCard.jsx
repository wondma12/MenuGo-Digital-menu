import React from 'react'
import { CheckIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import Badge from '../../../common/Badge'

const PlanCard = ({ plan, onEdit, onDelete }) => {
  const tierColors = {
    basic: 'blue',
    premium: 'purple',
    enterprise: 'gold',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900 capitalize">{plan.tier}</h3>
            <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
          </div>
          <Badge variant={tierColors[plan.tier]} size="md">
            {plan.tier}
          </Badge>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">${plan.priceMonthly}</span>
            <span className="text-gray-500">/month</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            or ${plan.priceYearly}/year (save {Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100)}%)
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {plan.features?.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
          <button onClick={onEdit} className="flex-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2">
            <PencilIcon className="w-4 h-4" />
            Edit
          </button>
          <button onClick={onDelete} className="flex-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center gap-2">
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlanCard