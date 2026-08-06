import {useEffect, useMemo, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheckIcon, BuildingOfficeIcon, EnvelopeIcon, UserCircleIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../../../store/authStore'
import Avatar from '../../common/Avatar'
import Button from '../../common/Button'
import Input from '../../../common/Input'
import FileUpload from '../../../common/FileUpload'
import { uploadFile } from '../../../services/uploadService'
import toast from 'react-hot-toast'

const PlatformProfile = () => {
  const navigate = useNavigate()
  const { user, updateProfile, changePassword } = useAuthStore()

  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: '',
    coverImageUrl: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [profileErrors, setProfileErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)

  const displayName = user?.fullName || user?.full_name || user?.name || 'Platform Admin'
  const email = user?.email || 'admin@menugo.com'
  const roleLabel = 'Platform Admin'
  const avatarSrc = user?.avatar || user?.avatar_url || user?.photoURL || null
  const coverSrc = useMemo(() => user?.preferences?.coverImageUrl || user?.preferences?.cover_image_url || null, [user])

  useEffect(() => {
    setProfileData({
      full_name: user?.fullName || user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar_url: user?.avatar || user?.avatar_url || '',
      coverImageUrl: user?.preferences?.coverImageUrl || user?.preferences?.cover_image_url || '',
    })
    setAvatarPreview(user?.avatar || user?.avatar_url || null)
    setCoverPreview(user?.preferences?.coverImageUrl || user?.preferences?.cover_image_url || null)
  }, [user])

  const stats = [
    { label: 'Role', value: roleLabel, icon: ShieldCheckIcon },
    { label: 'Email', value: email, icon: EnvelopeIcon },
    { label: 'Access', value: 'Platform-wide', icon: BuildingOfficeIcon },
  ]

  const handleAvatarUpload = async (fileOrFiles) => {
    const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles
    if (!file) return
    setUploadingAvatar(true)
    try {
      const result = await uploadFile(file, 'platform-profile')
      const nextUrl = result?.url || ''
      setProfileData((current) => ({ ...current, avatar_url: nextUrl }))
      setAvatarPreview(nextUrl)
    } catch (error) {
      toast.error('Failed to upload logo')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleCoverUpload = async (fileOrFiles) => {
    const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles
    if (!file) return
    setUploadingCover(true)
    try {
      const result = await uploadFile(file, 'platform-profile-covers')
      const nextUrl = result?.url || ''
      setProfileData((current) => ({ ...current, coverImageUrl: nextUrl }))
      setCoverPreview(nextUrl)
    } catch (error) {
      toast.error('Failed to upload cover image')
    } finally {
      setUploadingCover(false)
    }
  }

  const handleProfileSave = async (event) => {
    event.preventDefault()
    setProfileErrors({})
    setSavingProfile(true)

    try {
      const response = await updateProfile({
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone,
        avatar_url: profileData.avatar_url,
        preferences: {
          ...(user?.preferences || {}),
          coverImageUrl: profileData.coverImageUrl,
        },
      })

      const updatedUser = response?.user || response?.data?.user || response?.data || response
      if (updatedUser) {
        setProfileData({
          full_name: updatedUser.full_name || updatedUser.fullName || '',
          email: updatedUser.email || '',
          phone: updatedUser.phone || '',
          avatar_url: updatedUser.avatar_url || updatedUser.avatar || '',
          coverImageUrl: updatedUser.preferences?.coverImageUrl || updatedUser.preferences?.cover_image_url || '',
        })
        setAvatarPreview(updatedUser.avatar_url || updatedUser.avatar || null)
        setCoverPreview(updatedUser.preferences?.coverImageUrl || updatedUser.preferences?.cover_image_url || null)
      }

      toast.success('Profile updated successfully')
    } catch (error) {
      const status = error?.response?.status
      if (status === 409) {
        setProfileErrors({ email: 'This email address is already in use.' })
      }
      toast.error(error?.response?.data?.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!passwordData.currentPassword) nextErrors.currentPassword = 'Current password is required'
    if (!passwordData.newPassword) nextErrors.newPassword = 'New password is required'
    if (passwordData.newPassword && passwordData.newPassword.length < 6) nextErrors.newPassword = 'Password must be at least 6 characters'
    if (passwordData.newPassword !== passwordData.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match'

    setPasswordErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSavingPassword(true)
    try {
      await changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword, confirmPassword: passwordData.confirmPassword })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password changed successfully')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to change password')
    } finally {
      setSavingPassword(false)
    }
  }

  const canSaveProfile = profileData.full_name || profileData.email || profileData.phone || profileData.avatar_url || profileData.coverImageUrl

  return (
    <div className="relative space-y-6 overflow-hidden bg-slate-50 p-4 font-['Manrope',system-ui,sans-serif] text-slate-900 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.08),transparent_35%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-6">
       
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar src={avatarPreview || avatarSrc} name={displayName} size="xl" className="ring-4 ring-orange-100" />
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-orange-600">Platform administrator</p>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">{displayName}</h2>
                  <p className="text-sm text-slate-500">{email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => navigate('/platform/dashboard')} className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-700 hover:to-orange-600 shadow-lg shadow-orange-600/30">
                  Back to Dashboard
                </Button>
                <Button onClick={() => navigate('/platform/system/settings')} variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                  System Settings
                </Button>
              </div>
            </div>
        

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <form onSubmit={handleProfileSave} className="space-y-6 rounded-none border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Profile details</p>
              <h3 className="text-lg font-black tracking-tight text-slate-900">Branding and contact info</h3>
              <p className="text-sm text-slate-500">Upload a logo/avatar and cover image, then keep your email and phone details current.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3 rounded-none border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-3 text-slate-900">
                  <PhotoIcon className="h-5 w-5 text-orange-500" />
                  <p className="font-semibold">Logo / Avatar</p>
                </div>
                <FileUpload onFileSelect={handleAvatarUpload} accept={{ 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] }} label="Upload logo" />
                <Input label="Logo URL" value={profileData.avatar_url} onChange={(e) => setProfileData((current) => ({ ...current, avatar_url: e.target.value }))} placeholder="https://example.com/logo.png" />
                {avatarPreview && <img src={avatarPreview} alt="Logo preview" className="h-28 w-28 rounded-none object-cover ring-1 ring-slate-200" />}
                <p className="text-xs text-slate-500">Used as the profile avatar/logo across the platform.</p>
              </div>
 <div>
            <div className="grid gap-4 md:grid-cols-1">
              <Input label="Full Name" value={profileData.full_name} onChange={(e) => setProfileData((current) => ({ ...current, full_name: e.target.value }))} required />
              <Input label="Email" type="email" value={profileData.email} onChange={(e) => setProfileData((current) => ({ ...current, email: e.target.value }))} required error={profileErrors.email} />
              <Input label="Phone" value={profileData.phone} onChange={(e) => setProfileData((current) => ({ ...current, phone: e.target.value }))} />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-none border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <span>Current profile email and password are managed here.</span>
              <span className="font-medium text-slate-900">{canSaveProfile ? 'Ready to save' : 'No changes yet'}</span>
            </div>

            <div className="flex justify-end">
              <Button type="submit" isLoading={savingProfile || uploadingAvatar || uploadingCover} className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white">
                Save Profile
              </Button>
            </div>
         </div>
              {/* <div className="space-y-3 rounded-none border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-3 text-slate-900">
                  <PhotoIcon className="h-5 w-5 text-blue-500" />
                  <p className="font-semibold">Cover image</p>
                </div>
                <FileUpload onFileSelect={handleCoverUpload} accept={{ 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] }} label="Upload cover" />
                <Input label="Cover Image URL" value={profileData.coverImageUrl} onChange={(e) => setProfileData((current) => ({ ...current, coverImageUrl: e.target.value }))} placeholder="https://example.com/cover.jpg" />
                {coverPreview && <img src={coverPreview} alt="Cover preview" className="h-28 w-full rounded-none object-cover ring-1 ring-slate-200" />}
                <p className="text-xs text-slate-500">Shown on the profile banner and saved in your preferences.</p>
              </div> */}
            </div>
         
          </form>

          <div className="space-y-6">
            <div className="rounded-none border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Security</p>
                <h3 className="text-lg font-black tracking-tight text-slate-900">Change password</h3>
              </div>

              <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                <Input label="Current Password" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData((current) => ({ ...current, currentPassword: e.target.value }))} error={passwordErrors.currentPassword} required />
                <Input label="New Password" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData((current) => ({ ...current, newPassword: e.target.value }))} error={passwordErrors.newPassword} required />
                <Input label="Confirm New Password" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData((current) => ({ ...current, confirmPassword: e.target.value }))} error={passwordErrors.confirmPassword} required />
                <div className="flex justify-end pt-2">
                  <Button type="submit" isLoading={savingPassword} className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-700 hover:to-orange-600 shadow-lg shadow-orange-600/30">
                    Update Password
                  </Button>
                </div>
              </form>
            </div>

            <div className="rounded-none border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="mb-4 flex items-center gap-3 last:mb-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                      <p className="font-semibold text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlatformProfile
