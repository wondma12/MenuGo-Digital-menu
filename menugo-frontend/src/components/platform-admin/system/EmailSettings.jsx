import {useState} from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { CheckIcon } from '@heroicons/react/24/outline'
import Input from '../../../common/Input'
import Button from '../../../common/Button'
import Switch from '../../../common/Switch'
import { updateEmailSettings, testEmailSettings } from '../../../services/systemService'
import toast from 'react-hot-toast'

const EmailSettings = ({ settings, onSave }) => {
  const [formData, setFormData] = useState({
    smtpHost: settings?.smtpHost || '',
    smtpPort: settings?.smtpPort || 587,
    smtpUser: settings?.smtpUser || '',
    smtpPass: settings?.smtpPass || '',
    fromEmail: settings?.fromEmail || '',
    fromName: settings?.fromName || 'MenuGo',
    encryption: settings?.encryption || 'tls',
    sendWelcomeEmail: settings?.sendWelcomeEmail ?? true,
    sendOrderNotifications: settings?.sendOrderNotifications ?? true,
    sendNewsletter: settings?.sendNewsletter ?? false,
  })

  const [testEmail, setTestEmail] = useState('')

  const testMutation = useMutation(testEmailSettings, {
    onSuccess: () => {
      toast.success('Test email sent successfully')
      setTestEmail('')
    },
    onError: () => {
      toast.error('Failed to send test email')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ type: 'email', data: formData })
  }

  const handleTest = () => {
    if (testEmail) {
      testMutation.mutate({ settings: formData, testEmail })
    } else {
      toast.error('Please enter a test email address')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 border border-orange-100 border-l-4 border-l-orange-500 rounded-none shadow-[0_16px_40px_rgba(15,23,42,0.06)] space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="SMTP Host"
          value={formData.smtpHost}
          onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
          required
        />
        <Input
          label="SMTP Port"
          type="number"
          value={formData.smtpPort}
          onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) })}
          required
        />
        <Input
          label="SMTP Username"
          value={formData.smtpUser}
          onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
          required
        />
        <Input
          label="SMTP Password"
          type="password"
          value={formData.smtpPass}
          onChange={(e) => setFormData({ ...formData, smtpPass: e.target.value })}
          required
        />
        <Input
          label="From Email"
          type="email"
          value={formData.fromEmail}
          onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
          required
        />
        <Input
          label="From Name"
          value={formData.fromName}
          onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
          required
        />
      </div>

      <div className="space-y-3">
        <Switch
          label="Send Welcome Email"
          checked={formData.sendWelcomeEmail}
          onChange={(checked) => setFormData({ ...formData, sendWelcomeEmail: checked })}
        />
        <Switch
          label="Send Order Notifications"
          checked={formData.sendOrderNotifications}
          onChange={(checked) => setFormData({ ...formData, sendOrderNotifications: checked })}
        />
        <Switch
          label="Send Newsletter"
          checked={formData.sendNewsletter}
          onChange={(checked) => setFormData({ ...formData, sendNewsletter: checked })}
        />
      </div>

      <div className="border-t border-orange-100 pt-4 mt-4">
        <h4 className="text-sm font-medium text-slate-900 mb-3">Test Email Configuration</h4>
        <div className="flex gap-3">
          <Input
            placeholder="Enter email address to send test"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1"
          />
          <Button type="button" onClick={handleTest} isLoading={testMutation.isLoading} className="bg-orange-600 hover:bg-orange-700 text-white rounded-none px-4 py-2.5 shadow-sm">
            Send Test
          </Button>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" icon={CheckIcon} className="bg-orange-600 hover:bg-orange-700 text-white rounded-none px-4 py-2.5 shadow-sm">Save Changes</Button>
      </div>
    </form>
  )
}

export default EmailSettings
