import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Input from '../../../common/Input'
import Textarea from '../../../common/Textarea'
import Button from '../../../common/Button'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

const schema = yup.object({
  name: yup.string().required('Plan name is required'),
  tier: yup.string().required('Tier is required'),
  description: yup.string(),
  priceMonthly: yup.number().positive().required('Monthly price is required'),
  priceYearly: yup.number().positive().required('Yearly price is required'),
})

const PlanForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [features, setFeatures] = useState(initialData?.features || [''])
  const [limits, setLimits] = useState(initialData?.limits || {
    maxMenuItems: 50,
    maxStaff: 5,
    maxOrdersPerDay: 100,
    storageGB: 1,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData || {
      tier: 'basic',
    },
  })

  useEffect(() => {
    if (initialData) {
      reset(initialData)
      setFeatures(initialData.features || [''])
      setLimits(initialData.limits || {
        maxMenuItems: 50,
        maxStaff: 5,
        maxOrdersPerDay: 100,
        storageGB: 1,
      })
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
    onSubmit({
      ...data,
      features: features.filter(f => f.trim()),
      limits,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-slate-900">
      <Input label="Plan Name" {...register('name')} error={errors.name?.message} required />
      
      <select {...register('tier')} className="w-full rounded-none border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100">
        <option value="basic" className="text-slate-900">Basic</option>
        <option value="premium" className="text-slate-900">Premium</option>
        <option value="enterprise" className="text-slate-900">Enterprise</option>
      </select>
      
      <Textarea label="Description" {...register('description')} error={errors.description?.message} rows={3} />
      
      <div className="grid grid-cols-2 gap-4">
        <Input label="Monthly Price ($)" type="number" step="0.01" {...register('priceMonthly')} error={errors.priceMonthly?.message} required />
        <Input label="Yearly Price ($)" type="number" step="0.01" {...register('priceYearly')} error={errors.priceYearly?.message} required />
      </div>

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

      {/* Limits */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Limits</label>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Max Menu Items" type="number" value={limits.maxMenuItems} onChange={(e) => setLimits({ ...limits, maxMenuItems: parseInt(e.target.value) })} />
          <Input label="Max Staff" type="number" value={limits.maxStaff} onChange={(e) => setLimits({ ...limits, maxStaff: parseInt(e.target.value) })} />
          <Input label="Max Orders/Day" type="number" value={limits.maxOrdersPerDay} onChange={(e) => setLimits({ ...limits, maxOrdersPerDay: parseInt(e.target.value) })} />
          <Input label="Storage (GB)" type="number" value={limits.storageGB} onChange={(e) => setLimits({ ...limits, storageGB: parseInt(e.target.value) })} />
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