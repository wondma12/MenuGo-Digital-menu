import React, { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import Input from '../../../common/Input'
import Switch from '../../../common/Switch'
import Button from '../../../common/Button'
import { updateDeliverySettings } from '../../../services/restaurantService'
import toast from 'react-hot-toast'

const DeliverySettings = ({ settings }) => {
  const [formData, setFormData] = useState({
    enableDelivery: settings?.enableDelivery || false,
    enableTakeaway: settings?.enableTakeaway || true,
    deliveryRadius: settings?.deliveryRadius || 5,
    deliveryFee: settings?.deliveryFee || 3.99,
    freeDeliveryThreshold: settings?.freeDeliveryThreshold || 30,
    minimumOrderAmount: settings?.minimumOrderAmount || 10,
    estimatedDeliveryTime: settings?.estimatedDeliveryTime || 30,
  })

  const queryClient = useQueryClient()
  const mutation = useMutation(updateDeliverySettings, {
    onSuccess: () => {
      queryClient.invalidateQueries('restaurantSettings')
      toast.success('Delivery settings updated')
    },
    onError: () => toast.error('Failed to update settings'),
  })

  const handleSubmit = () => {
    mutation.mutate(formData)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <Switch
          label="Enable Delivery"
          checked={formData.enableDelivery}
          onChange={(checked) => setFormData({ ...formData, enableDelivery: checked })}
        />
        <Switch
          label="Enable Takeaway"
          checked={formData.enableTakeaway}
          onChange={(checked) => setFormData({ ...formData, enableTakeaway: checked })}
        />

        {formData.enableDelivery && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Delivery Radius (km)"
                type="number"
                value={formData.deliveryRadius}
                onChange={(e) => setFormData({ ...formData, deliveryRadius: parseFloat(e.target.value) })}
              />
              <Input
                label="Delivery Fee ($)"
                type="number"
                step="0.01"
                value={formData.deliveryFee}
                onChange={(e) => setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) })}
              />
              <Input
                label="Free Delivery Threshold ($)"
                type="number"
                step="0.01"
                value={formData.freeDeliveryThreshold}
                onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: parseFloat(e.target.value) })}
              />
              <Input
                label="Estimated Delivery Time (min)"
                type="number"
                value={formData.estimatedDeliveryTime}
                onChange={(e) => setFormData({ ...formData, estimatedDeliveryTime: parseInt(e.target.value) })}
              />
            </div>
          </>
        )}

        <Input
          label="Minimum Order Amount ($)"
          type="number"
          step="0.01"
          value={formData.minimumOrderAmount}
          onChange={(e) => setFormData({ ...formData, minimumOrderAmount: parseFloat(e.target.value) })}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} isLoading={mutation.isLoading} className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-orange-600">Save Settings</Button>
      </div>
    </div>
  )
}

export default DeliverySettings