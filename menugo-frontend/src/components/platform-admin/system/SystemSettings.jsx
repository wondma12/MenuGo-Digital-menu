import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { CheckIcon } from '@heroicons/react/24/outline'
import Tabs from '../../../common/Tabs'
import Button from '../../../common/Button'
import Input from '../../../common/Input'
import Switch from '../../../common/Switch'
import Loading from '../../../common/Loading'
import FileUpload from '../../../common/FileUpload'
import { uploadFile } from '../../../services/uploadService'
import { getSystemSettings, updateSystemSettings } from '../../../services/systemService'
import { useQueryClient } from 'react-query'
import toast from 'react-hot-toast'

const SystemSettings = () => {
  const navigate = useNavigate()
  const { data: settings, isLoading, isError, error, refetch } = useQuery('systemSettings', getSystemSettings)
  const queryClient = useQueryClient()
  const mutation = useMutation(updateSystemSettings, {
    onSuccess: (data) => {
      toast.success('Settings saved successfully')
      try { queryClient.invalidateQueries('systemSettings') } catch (e) {}
    },
    onError: () => toast.error('Failed to save settings'),
  })

  if (isLoading) return <Loading />

  // Handle auth/permission errors from API
  if (isError) {
    const status = error?.response?.status
    // If unauthorized, navigate to login so token refresh/login flow can occur
    if (status === 401) {
      navigate('/login')
      return null
    }

    // Forbidden - show helpful message
    if (status === 403) {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-red-500 mt-4">You do not have permission to view system settings.</p>
        </div>
      )
    }

    // Other errors - show retry option
    return (
      <div className="space-y-6 bg-white p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Failed to load settings: {error?.message || 'Unknown error'}</p>
        <div className="mt-4">
          <button onClick={() => refetch()} className="px-4 py-2 bg-orange-600 text-white rounded">Retry</button>
        </div>
      </div>
    )
  }

  const tabs = [
    { label: 'General', content: <GeneralSettings settings={settings} onSave={mutation.mutate} /> },
    { label: 'Email', content: <EmailSettings settings={settings} onSave={mutation.mutate} /> },
    { label: 'Security', content: <SecuritySettings settings={settings} onSave={mutation.mutate} /> },
    { label: 'Integrations', content: <IntegrationSettings settings={settings} onSave={mutation.mutate} /> },
  ]

  return (
    <div className="relative overflow-hidden bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 font-['Manrope',system-ui,sans-serif] text-slate-900">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">System Settings</h1>
        <p className="text-sm text-slate-600 mt-1">Configure platform-wide settings</p>
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
    platformLogoUrl: settings?.platform_logo || settings?.logo || settings?.logo_url || settings?.branding?.logo || settings?.preferences?.logo || '',
  })

  const [uploadingLogo, setUploadingLogo] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...formData,
      platform_logo: formData.platformLogoUrl,
    }
    onSave({ type: 'general', data: payload })
  }

  const handleLogoUpload = async (fileOrFiles) => {
    const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles
    if (!file) return
    setUploadingLogo(true)
    try {
      const res = await uploadFile(file, 'system-logo')
      const url = res?.url || ''
      setFormData((s) => ({ ...s, platformLogoUrl: url }))
    } catch (e) {
      console.error(e)
    } finally {
      setUploadingLogo(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 border border-orange-100 border-l-4 border-l-orange-500 rounded-none shadow-[0_16px_40px_rgba(15,23,42,0.06)] space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-slate-600">Platform logo (shown in header and admin)</p>
        <div className="grid gap-4 md:grid-cols-3 items-center">
          <FileUpload onFileSelect={handleLogoUpload} accept={{ 'image/*': ['.jpeg', '.png', '.jpg', '.webp', '.svg'] }} label="Upload logo" />
          <Input label="Logo URL" value={formData.platformLogoUrl} onChange={(e) => setFormData((current) => ({ ...current, platformLogoUrl: e.target.value }))} placeholder="https://example.com/logo.png" />
          <div className="flex items-center">
            {formData.platformLogoUrl ? <img src={formData.platformLogoUrl} alt="logo preview" className="h-12 w-12 object-contain" onError={(e) => (e.currentTarget.src = '/logo.svg')} /> : <div className="h-12 w-12 bg-slate-100" />}
          </div>
        </div>
      </div>
      <Input label="Platform Name" value={formData.platformName} onChange={(e) => setFormData({ ...formData, platformName: e.target.value })} />
      <Input label="Support Email" type="email" value={formData.supportEmail} onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })} />
      <Switch label="Maintenance Mode" checked={formData.maintenanceMode} onChange={(checked) => setFormData({ ...formData, maintenanceMode: checked })} />
      <Switch label="Allow New Registrations" checked={formData.allowRegistration} onChange={(checked) => setFormData({ ...formData, allowRegistration: checked })} />
      <div className="flex justify-end">
        <Button type="submit" icon={CheckIcon} className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2.5 text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-orange-600">Save Changes</Button>
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
    <form onSubmit={handleSubmit} className="bg-white p-6 border border-orange-100 border-l-4 border-l-orange-500 rounded-none shadow-[0_16px_40px_rgba(15,23,42,0.06)] space-y-4">
      <Input label="SMTP Host" value={formData.smtpHost} onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })} />
      <Input label="SMTP Port" type="number" value={formData.smtpPort} onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) })} />
      <Input label="SMTP Username" value={formData.smtpUser} onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })} />
      <Input label="SMTP Password" type="password" value={formData.smtpPass} onChange={(e) => setFormData({ ...formData, smtpPass: e.target.value })} />
      <Input label="From Email" type="email" value={formData.fromEmail} onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })} />
      <Input label="From Name" value={formData.fromName} onChange={(e) => setFormData({ ...formData, fromName: e.target.value })} />
      <div className="flex justify-end">
        <Button type="submit" icon={CheckIcon} className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2.5 text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-orange-600">Save Changes</Button>
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
    <form onSubmit={handleSubmit} className="bg-white p-6 border border-orange-100 border-l-4 border-l-orange-500 rounded-none shadow-[0_16px_40px_rgba(15,23,42,0.06)] space-y-4">
      <Input label="Session Timeout (minutes)" type="number" value={formData.sessionTimeout} onChange={(e) => setFormData({ ...formData, sessionTimeout: parseInt(e.target.value) })} />
      <Input label="Max Login Attempts" type="number" value={formData.maxLoginAttempts} onChange={(e) => setFormData({ ...formData, maxLoginAttempts: parseInt(e.target.value) })} />
      <Input label="Password Expiry (days)" type="number" value={formData.passwordExpiryDays} onChange={(e) => setFormData({ ...formData, passwordExpiryDays: parseInt(e.target.value) })} />
      <Switch label="Require Two-Factor Authentication for Admins" checked={formData.twoFactorRequired} onChange={(checked) => setFormData({ ...formData, twoFactorRequired: checked })} />
      <div className="flex justify-end">
        <Button type="submit" icon={CheckIcon} className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2.5 text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-orange-600">Save Changes</Button>
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
    <form onSubmit={handleSubmit} className="bg-white p-6 border border-orange-100 border-l-4 border-l-orange-500 rounded-none shadow-[0_16px_40px_rgba(15,23,42,0.06)] space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Stripe Secret Key"
          type="password"
          value={formData.stripeSecretKey}
          onChange={(e) => setFormData({ ...formData, stripeSecretKey: e.target.value })}
          className="rounded-none border-slate-200 text-slate-900 focus:border-orange-300 focus:ring-orange-100"
        />
        <Input
          label="Stripe Webhook Secret"
          type="password"
          value={formData.stripeWebhookSecret}
          onChange={(e) => setFormData({ ...formData, stripeWebhookSecret: e.target.value })}
          className="rounded-none border-slate-200 text-slate-900 focus:border-orange-300 focus:ring-orange-100"
        />
        <Input
          label="Google Analytics ID"
          value={formData.googleAnalyticsId}
          onChange={(e) => setFormData({ ...formData, googleAnalyticsId: e.target.value })}
          className="rounded-none border-slate-200 text-slate-900 focus:border-orange-300 focus:ring-orange-100"
        />
        <Input
          label="Sentry DSN"
          value={formData.sentryDsn}
          onChange={(e) => setFormData({ ...formData, sentryDsn: e.target.value })}
          className="rounded-none border-slate-200 text-slate-900 focus:border-orange-300 focus:ring-orange-100"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" icon={CheckIcon} className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2.5 text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-orange-600">Save Changes</Button>
      </div>
    </form>
  )
}

export default SystemSettings
