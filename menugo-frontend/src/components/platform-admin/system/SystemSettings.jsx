import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import { CheckIcon } from '@heroicons/react/24/outline'
import Tabs from '../../../common/Tabs'
import Button from '../../../common/Button'
import Input from '../../../common/Input'
import Switch from '../../../common/Switch'
import Loading from '../../../common/Loading'
import { getSystemSettings, updateSystemSettings } from '../../../services/systemService'
import toast from 'react-hot-toast'

const SystemSettings = () => {
  const { data: settings, isLoading } = useQuery('systemSettings', getSystemSettings)
  const mutation = useMutation(updateSystemSettings, {
    onSuccess: () => toast.success('Settings saved successfully'),
    onError: () => toast.error('Failed to save settings'),
  })

  if (isLoading) return <Loading />

  const tabs = [
    { label: 'General', content: <GeneralSettings settings={settings} onSave={mutation.mutate} /> },
    { label: 'Email', content: <EmailSettings settings={settings} onSave={mutation.mutate} /> },
    { label: 'Security', content: <SecuritySettings settings={settings} onSave={mutation.mutate} /> },
    { label: 'Integrations', content: <IntegrationSettings settings={settings} onSave={mutation.mutate} /> },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500 mt-1">Configure platform-wide settings</p>
      </div>
      <Tabs tabs={tabs} />
    </div>
  )
}

const GeneralSettings = ({ settings, onSave }) => {
  const [formData, setFormData] = useState({
    platformName: settings?.platformName || 'MenuGo',
    supportEmail: settings?.supportEmail || '',
    maintenanceMode: settings?.maintenanceMode || false,
    allowRegistration: settings?.allowRegistration || true,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ type: 'general', data: formData })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
      <Input label="Platform Name" value={formData.platformName} onChange={(e) => setFormData({ ...formData, platformName: e.target.value })} />
      <Input label="Support Email" type="email" value={formData.supportEmail} onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })} />
      <Switch label="Maintenance Mode" checked={formData.maintenanceMode} onChange={(checked) => setFormData({ ...formData, maintenanceMode: checked })} />
      <Switch label="Allow New Registrations" checked={formData.allowRegistration} onChange={(checked) => setFormData({ ...formData, allowRegistration: checked })} />
      <div className="flex justify-end">
        <Button type="submit" icon={CheckIcon}>Save Changes</Button>
      </div>
    </form>
  )
}

const EmailSettings = ({ settings, onSave }) => {
  const [formData, setFormData] = useState({
    smtpHost: settings?.smtpHost || '',
    smtpPort: settings?.smtpPort || 587,
    smtpUser: settings?.smtpUser || '',
    smtpPass: settings?.smtpPass || '',
    fromEmail: settings?.fromEmail || '',
    fromName: settings?.fromName || 'MenuGo',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ type: 'email', data: formData })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
      <Input label="SMTP Host" value={formData.smtpHost} onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })} />
      <Input label="SMTP Port" type="number" value={formData.smtpPort} onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) })} />
      <Input label="SMTP Username" value={formData.smtpUser} onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })} />
      <Input label="SMTP Password" type="password" value={formData.smtpPass} onChange={(e) => setFormData({ ...formData, smtpPass: e.target.value })} />
      <Input label="From Email" type="email" value={formData.fromEmail} onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })} />
      <Input label="From Name" value={formData.fromName} onChange={(e) => setFormData({ ...formData, fromName: e.target.value })} />
      <div className="flex justify-end">
        <Button type="submit" icon={CheckIcon}>Save Changes</Button>
      </div>
    </form>
  )
}

const SecuritySettings = ({ settings, onSave }) => {
  const [formData, setFormData] = useState({
    sessionTimeout: settings?.sessionTimeout || 60,
    maxLoginAttempts: settings?.maxLoginAttempts || 5,
    twoFactorRequired: settings?.twoFactorRequired || false,
    passwordExpiryDays: settings?.passwordExpiryDays || 90,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ type: 'security', data: formData })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
      <Input label="Session Timeout (minutes)" type="number" value={formData.sessionTimeout} onChange={(e) => setFormData({ ...formData, sessionTimeout: parseInt(e.target.value) })} />
      <Input label="Max Login Attempts" type="number" value={formData.maxLoginAttempts} onChange={(e) => setFormData({ ...formData, maxLoginAttempts: parseInt(e.target.value) })} />
      <Input label="Password Expiry (days)" type="number" value={formData.passwordExpiryDays} onChange={(e) => setFormData({ ...formData, passwordExpiryDays: parseInt(e.target.value) })} />
      <Switch label="Require Two-Factor Authentication for Admins" checked={formData.twoFactorRequired} onChange={(checked) => setFormData({ ...formData, twoFactorRequired: checked })} />
      <div className="flex justify-end">
        <Button type="submit" icon={CheckIcon}>Save Changes</Button>
      </div>
    </form>
  )
}

const IntegrationSettings = ({ settings, onSave }) => {
  const [formData, setFormData] = useState({
    stripeSecretKey: settings?.stripeSecretKey || '',
    stripeWebhookSecret: settings?.stripeWebhookSecret || '',
    googleAnalyticsId: settings?.googleAnalyticsId || '',
    sentryDsn: settings?.sentryDsn || '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ type: 'integrations', data: formData })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
      <Input label="Stripe Secret Key" type="password" value={formData.stripeSecretKey} onChange={(e) => setFormData({ ...formData, stripeSecretKey: e.target.value })} />
      <Input label="Stripe Webhook Secret" type="password" value={formData.stripeWebhookSecret} onChange={(e) => setFormData({ ...formData, stripeWebhookSecret: e.target.value })} />
      <Input label="Google Analytics ID" value={formData.googleAnalyticsId} onChange={(e) => setFormData({ ...formData, googleAnalyticsId: e.target.value })} />
      <Input label="Sentry DSN" value={formData.sentryDsn} onChange={(e) => setFormData({ ...formData, sentryDsn: e.target.value })} />
      <div className="flex justify-end">
        <Button type="submit" icon={CheckIcon}>Save Changes</Button>
      </div>
    </form>
  )
}

export default SystemSettings
