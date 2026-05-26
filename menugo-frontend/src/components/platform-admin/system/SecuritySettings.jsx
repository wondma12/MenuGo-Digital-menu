import React, { useState } from 'react'
import Input from '../../../common/Input'
import Button from '../../../common/Button'
import Switch from '../../../common/Switch'
import { CheckIcon } from '@heroicons/react/24/outline'

const SecuritySettings = ({ settings, onSave }) => {
  const [formData, setFormData] = useState({
    sessionTimeout: settings?.sessionTimeout || 60,
    maxLoginAttempts: settings?.maxLoginAttempts || 5,
    passwordExpiryDays: settings?.passwordExpiryDays || 90,
    twoFactorRequired: settings?.twoFactorRequired || false,
    ipWhitelist: settings?.ipWhitelist?.join(', ') || '',
    rateLimitPerMinute: settings?.rateLimitPerMinute || 100,
    allowedOrigins: settings?.allowedOrigins?.join(', ') || '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const processedData = {
      ...formData,
      ipWhitelist: formData.ipWhitelist.split(',').map(s => s.trim()).filter(Boolean),
      allowedOrigins: formData.allowedOrigins.split(',').map(s => s.trim()).filter(Boolean),
    }
    onSave({ type: 'security', data: processedData })
  }

  return (
      <form onSubmit={handleSubmit} className="bg-white p-6 border border-orange-100 border-l-4 border-l-orange-500 rounded-none shadow-[0_16px_40px_rgba(15,23,42,0.06)] space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Session Timeout (minutes)"
          type="number"
          value={formData.sessionTimeout}
          onChange={(e) => setFormData({ ...formData, sessionTimeout: parseInt(e.target.value) })}
        />
        <Input
          label="Max Login Attempts"
          type="number"
          value={formData.maxLoginAttempts}
          onChange={(e) => setFormData({ ...formData, maxLoginAttempts: parseInt(e.target.value) })}
        />
        <Input
          label="Password Expiry (days)"
          type="number"
          value={formData.passwordExpiryDays}
          onChange={(e) => setFormData({ ...formData, passwordExpiryDays: parseInt(e.target.value) })}
        />
        <Input
          label="Rate Limit (requests per minute)"
          type="number"
          value={formData.rateLimitPerMinute}
          onChange={(e) => setFormData({ ...formData, rateLimitPerMinute: parseInt(e.target.value) })}
        />
      </div>

      <Switch
        label="Require Two-Factor Authentication for Admins"
        checked={formData.twoFactorRequired}
        onChange={(checked) => setFormData({ ...formData, twoFactorRequired: checked })}
      />

      <Input
        label="IP Whitelist (comma-separated)"
        value={formData.ipWhitelist}
        onChange={(e) => setFormData({ ...formData, ipWhitelist: e.target.value })}
        placeholder="192.168.1.1, 10.0.0.1"
      />

      <Input
        label="Allowed Origins (CORS)"
        value={formData.allowedOrigins}
        onChange={(e) => setFormData({ ...formData, allowedOrigins: e.target.value })}
        placeholder="https://example.com, https://app.example.com"
      />

        <div className="flex justify-end pt-4">
          <Button type="submit" icon={CheckIcon} className="bg-orange-600 hover:bg-orange-700 text-white rounded-none px-4 py-2.5 shadow-sm">Save Changes</Button>
        </div>
    </form>
  )
}

export default SecuritySettings
