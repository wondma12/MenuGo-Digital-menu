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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input label="Plan Name" {...register('name')} error={errors.name?.message} required />
      
      <select {...register('tier')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-black">
        <option value="basic" className="text-black">Basic</option>
        <option value="premium" className="text-black">Premium</option>
        <option value="enterprise" className="text-black">Enterprise</option>
      </select>
      
      <Textarea label="Description" {...register('description')} error={errors.description?.message} rows={3} />
      
      <div className="grid grid-cols-2 gap-4">
        <Input label="Monthly Price ($)" type="number" step="0.01" {...register('priceMonthly')} error={errors.priceMonthly?.message} required />
        <Input label="Yearly Price ($)" type="number" step="0.01" {...register('priceYearly')} error={errors.priceYearly?.message} required />
      </div>

      {/* Features */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder="Enter feature"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {index === features.length - 1 && (
                <button type="button" onClick={addFeature} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
                  <PlusIcon className="w-5 h-5" />
                </button>
              )}
              {features.length > 1 && (
                <button type="button" onClick={() => removeFeature(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Limits */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Limits</label>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Max Menu Items" type="number" value={limits.maxMenuItems} onChange={(e) => setLimits({ ...limits, maxMenuItems: parseInt(e.target.value) })} />
          <Input label="Max Staff" type="number" value={limits.maxStaff} onChange={(e) => setLimits({ ...limits, maxStaff: parseInt(e.target.value) })} />
          <Input label="Max Orders/Day" type="number" value={limits.maxOrdersPerDay} onChange={(e) => setLimits({ ...limits, maxOrdersPerDay: parseInt(e.target.value) })} />
          <Input label="Storage (GB)" type="number" value={limits.storageGB} onChange={(e) => setLimits({ ...limits, storageGB: parseInt(e.target.value) })} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>{initialData ? 'Update Plan' : 'Create Plan'}</Button>
      </div>
    </form>
  )
}

export default PlanForm