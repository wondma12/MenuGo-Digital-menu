import React, { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import Switch from '../../../common/Switch'
import Button from '../../../common/Button'
import { updateNotificationSettings } from '../../../services/restaurantService'
import toast from 'react-hot-toast'

const NotificationSettings = ({ settings }) => {
  const [formData, setFormData] = useState({
    orderNotifications: settings?.orderNotifications || true,
    newOrderSound: settings?.newOrderSound || true,
    emailNotifications: settings?.emailNotifications || true,
    smsNotifications: settings?.smsNotifications || false,
    lowStockAlert: settings?.lowStockAlert || true,
    reviewAlert: settings?.reviewAlert || true,
    promotionNotifications: settings?.promotionNotifications || false,
    orderConfirmationEmail: settings?.orderConfirmationEmail || true,
    orderStatusSms: settings?.orderStatusSms || false,
  })

  const queryClient = useQueryClient()
  const mutation = useMutation(updateNotificationSettings, {
    onSuccess: () => {
      queryClient.invalidateQueries('restaurantSettings')
      toast.success('Notification settings updated')
    },
    onError: () => toast.error('Failed to update settings'),
  })

  const handleSubmit = () => {
    mutation.mutate(formData)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Notifications</h3>
        <Switch
          label="New Order Notifications"
          checked={formData.orderNotifications}
          onChange={(checked) => setFormData({ ...formData, orderNotifications: checked })}
        />
        <Switch
          label="Play Sound on New Order"
          checked={formData.newOrderSound}
          onChange={(checked) => setFormData({ ...formData, newOrderSound: checked })}
        />
        <Switch
          label="Order Confirmation Email to Customer"
          checked={formData.orderConfirmationEmail}
          onChange={(checked) => setFormData({ ...formData, orderConfirmationEmail: checked })}
        />
        <Switch
          label="Order Status SMS to Customer"
          checked={formData.orderStatusSms}
          onChange={(checked) => setFormData({ ...formData, orderStatusSms: checked })}
        />

        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Notifications</h3>
          <Switch
            label="Email Notifications"
            checked={formData.emailNotifications}
            onChange={(checked) => setFormData({ ...formData, emailNotifications: checked })}
          />
          <Switch
            label="SMS Notifications"
            checked={formData.smsNotifications}
            onChange={(checked) => setFormData({ ...formData, smsNotifications: checked })}
          />
          <Switch
            label="Low Stock Alerts"
            checked={formData.lowStockAlert}
            onChange={(checked) => setFormData({ ...formData, lowStockAlert: checked })}
          />
          <Switch
            label="New Review Alerts"
            checked={formData.reviewAlert}
            onChange={(checked) => setFormData({ ...formData, reviewAlert: checked })}
          />
          <Switch
            label="Promotion Notifications"
            checked={formData.promotionNotifications}
            onChange={(checked) => setFormData({ ...formData, promotionNotifications: checked })}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} isLoading={mutation.isLoading}>Save Settings</Button>
      </div>
    </div>
  )
}

export default NotificationSettings