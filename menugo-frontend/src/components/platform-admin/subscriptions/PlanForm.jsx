import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Input from '../../../common/Input'
import Textarea from '../../../common/Textarea'
import Button from '../../../common/Button'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

const getValidationSchema = (tier) => {
  return yup.object({
    name: yup.string().required('Plan name is required'),
    tier: yup.string().required('Tier is required'),
    description: yup.string(),
    price_monthly: tier === 'monthly' ? yup.number().positive().required('Monthly price is required') : yup.number(),
    price_six_month: tier === 'six_month' ? yup.number().positive().required('6-month price is required') : yup.number(),
    price_yearly: tier === 'yearly' ? yup.number().positive().required('Yearly price is required') : yup.number(),
  })
}

const normalizeFeatures = (features) => {
  if (!features) return ['']
  if (Array.isArray(features)) return features.length ? features : ['']
  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features)
      if (Array.isArray(parsed)) return parsed.length ? parsed : ['']
    } catch (e) {
      // ignore parse failures
    }
    return features.split(',').map((feature) => feature.trim()).filter(Boolean).filter((_, idx, arr) => arr.indexOf(_ ) === idx)
  }
  if (typeof features === 'object') {
    const normalized = Object.values(features)
      .filter((value) => value !== null && value !== undefined)
      .map((value) => (typeof value === 'string' ? value : String(value)))
      .filter(Boolean)
    return normalized.length ? normalized : ['']
  }
  return ['']
}

const PlanForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [features, setFeatures] = useState(normalizeFeatures(initialData?.features))
  const [tier, setTier] = useState(initialData?.tier || 'monthly')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(getValidationSchema(tier)),
    defaultValues: initialData || {
      tier: 'monthly',
      price_monthly: 29.99,
      price_six_month: 149.94,
      price_yearly: 299.99,
    },
  })

  const selectedTier = watch('tier')

  useEffect(() => {
    setTier(selectedTier)
  }, [selectedTier])

  useEffect(() => {
    if (initialData) {
      reset(initialData)
      setFeatures(normalizeFeatures(initialData.features))
      setTier(initialData.tier)
    }
  }, [initialData, reset])

  const addFeature = () => {
    setFeatures([...features, ''])
  }

  const removeFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const updateFeature = (index, value) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  const handleFormSubmit = (data) => {
    const submitData = {
      ...data,
      features: features.filter(f => f.trim()),
    }

    // Only include the relevant price based on tier
    if (data.tier === 'monthly') {
      submitData.price_monthly = data.price_monthly
      submitData.price_yearly = data.price_monthly
    } else if (data.tier === 'six_month') {
      submitData.price_monthly = Math.round((data.price_six_month / 6) * 100) / 100
      submitData.price_yearly = data.price_six_month
    } else if (data.tier === 'yearly') {
      submitData.price_monthly = Math.round((data.price_yearly / 12) * 100) / 100
      submitData.price_yearly = data.price_yearly
    }

    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-slate-900">
      <Input label="Plan Name" {...register('name')} error={errors.name?.message} required />
      
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Billing Period</label>
        <select {...register('tier')} className="w-full rounded-none border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100">
          <option value="monthly" className="text-slate-900">Monthly</option>
          <option value="six_month" className="text-slate-900">6-Month</option>
          <option value="yearly" className="text-slate-900">Yearly</option>
        </select>
      </div>
      
      <Textarea label="Description" {...register('description')} error={errors.description?.message} rows={3} />
      
      {/* Dynamic Price Input Based on Tier */}
      {tier === 'monthly' && (
        <Input label="Monthly Price (ETB)" type="number" step="0.01" {...register('price_monthly')} error={errors.price_monthly?.message} required />
      )}
      {tier === 'six_month' && (
        <Input label="6-Month Price (ETB)" type="number" step="0.01" {...register('price_six_month')} error={errors.price_six_month?.message} required />
      )}
      {tier === 'yearly' && (
        <Input label="Yearly Price (ETB)" type="number" step="0.01" {...register('price_yearly')} error={errors.price_yearly?.message} required />
      )}

      {/* Features */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Features</label>
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder="Enter feature"
                className="flex-1 rounded-none border border-slate-300 px-4 py-2 text-slate-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
              {index === features.length - 1 && (
                <button type="button" onClick={addFeature} className="rounded-none p-2 text-orange-600 hover:bg-orange-50">
                  <PlusIcon className="w-5 h-5" />
                </button>
              )}
              {features.length > 1 && (
                <button type="button" onClick={() => removeFeature(index)} className="rounded-none p-2 text-rose-600 hover:bg-rose-50">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="rounded-none">Cancel</Button>
        <Button type="submit" isLoading={isLoading} className="rounded-none bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600">{initialData ? 'Update Plan' : 'Create Plan'}</Button>
      </div>
    </form>
  )
}

export default PlanForm