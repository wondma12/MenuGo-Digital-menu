import {useState} from 'react'
import { useMutation } from 'react-query'
import Input from '../../common/Input'
import Button from '../../common/Button'
import { changeWaiterPassword } from '../../../services/waiterService'
import toast from 'react-hot-toast'

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})

  const mutation = useMutation(changeWaiterPassword, {
    onSuccess: () => {
      toast.success('Password changed successfully')
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: () => toast.error('Failed to change password')
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
        newPassword: formData.newPassword
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Current Password"
        type="password"
        autoComplete="current-password"
        value={formData.currentPassword}
        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
        error={errors.currentPassword}
        required
      />
      <Input
        label="New Password"
        type="password"
        autoComplete="new-password"
        value={formData.newPassword}
        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
        error={errors.newPassword}
        required
      />
      <Input
        label="Confirm New Password"
        type="password"
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        error={errors.confirmPassword}
        required
      />
      <div className="flex justify-end">
        <Button type="submit" isLoading={mutation.isLoading}>Update Password</Button>
      </div>
    </form>
  )
}

export default ChangePassword