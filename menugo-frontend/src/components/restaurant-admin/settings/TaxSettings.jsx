import React, { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import Input from '../../../common/Input'
import Switch from '../../../common/Switch'
import Button from '../../../common/Button'
import { updateTaxSettings } from '../../../services/restaurantService'
import toast from 'react-hot-toast'

const TaxSettings = ({ settings }) => {
  const [formData, setFormData] = useState({
    taxRate: settings?.taxRate ?? 10,
    serviceCharge: settings?.serviceCharge ?? 0,
    serviceChargeType: settings?.serviceChargeType ?? 'percentage',
    applyTaxToDelivery: settings?.applyTaxToDelivery ?? true,
    taxInclusive: settings?.taxInclusive ?? false,
  })

  const queryClient = useQueryClient()
  const mutation = useMutation(updateTaxSettings, {
    onSuccess: () => {
      queryClient.invalidateQueries('restaurantSettings')
      toast.success('Tax settings updated')
    },
    onError: () => toast.error('Failed to update settings'),
  })

  const handleSubmit = () => {
    mutation.mutate(formData)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tax Rate (%)"
            type="number"
            step="0.1"
            value={Number.isNaN(formData.taxRate) ? '' : formData.taxRate}
            onChange={(e) => {
              const v = e.target.value
              setFormData({ ...formData, taxRate: v === '' ? '' : parseFloat(v) })
            }}
          />
          <div className="flex items-end">
            <Switch
              label="Tax Inclusive Pricing"
              checked={formData.taxInclusive}
              onChange={(checked) => setFormData({ ...formData, taxInclusive: checked })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Service Charge"
            type="number"
            step="0.1"
            value={Number.isNaN(formData.serviceCharge) ? '' : formData.serviceCharge}
            onChange={(e) => {
              const v = e.target.value
              setFormData({ ...formData, serviceCharge: v === '' ? '' : parseFloat(v) })
            }}
          />
          <select
            value={formData.serviceChargeType}
            onChange={(e) => setFormData({ ...formData, serviceChargeType: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </select>
        </div>

        <Switch
          label="Apply Tax to Delivery Fee"
          checked={formData.applyTaxToDelivery}
          onChange={(checked) => setFormData({ ...formData, applyTaxToDelivery: checked })}
        />
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Tax rates vary by location. Please consult with a tax professional to ensure compliance with local regulations.
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} isLoading={mutation.isLoading}>Save Settings</Button>
      </div>
    </div>
  )
}

export default TaxSettings