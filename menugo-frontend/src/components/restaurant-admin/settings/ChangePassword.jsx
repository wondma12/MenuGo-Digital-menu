import React, { useState } from 'react'
import { useMutation } from 'react-query'
import Input from '../../../common/Input'
import Button from '../../../common/Button'
import { changePassword } from '../../../services/authService'
import toast from 'react-hot-toast'

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})

  const mutation = useMutation(changePassword, {
    onSuccess: () => {
      toast.success('Password changed successfully')
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setErrors({})
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password')
    },
  })

  const validate = () => {
    const newErrors = {}
    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required'
    if (!formData.newPassword) newErrors.newPassword = 'New password is required'
    if (formData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters'
    if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      mutation.mutate({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Change Password</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            error={errors.currentPassword}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            error={errors.newPassword}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            required
          />
          <div className="flex justify-end pt-4">
            <Button type="submit" isLoading={mutation.isLoading} className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-orange-600">Update Password</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword