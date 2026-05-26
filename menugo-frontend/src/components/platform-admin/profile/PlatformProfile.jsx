import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheckIcon, BuildingOfficeIcon, EnvelopeIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../../../store/authStore'
import Avatar from '../../common/Avatar'
import Button from '../../common/Button'

const PlatformProfile = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const displayName = user?.fullName || user?.full_name || user?.name || 'Platform Admin'
  const email = user?.email || 'admin@menugo.com'
  const roleLabel = 'Platform Admin'
  const avatarSrc = user?.avatar || user?.avatar_url || user?.photoURL || null

  const stats = [
    { label: 'Role', value: roleLabel, icon: ShieldCheckIcon },
    { label: 'Email', value: email, icon: EnvelopeIcon },
    { label: 'Access', value: 'Platform-wide', icon: BuildingOfficeIcon },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-orange-700 text-white shadow-xl overflow-hidden">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <img src="/logo.svg" alt="MenuGo" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-white/70">MenuGo Platform</p>
              <h1 className="mt-1 text-3xl font-bold">Profile</h1>
              <p className="text-white/70">Manage your platform identity and access.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/platform/dashboard')}
              className="bg-white text-slate-900 hover:bg-slate-100"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => navigate('/platform/settings')}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              Platform Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Avatar src={avatarSrc} name={displayName} size="xl" className="ring-4 ring-orange-100" />
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.2em] text-orange-600">Platform administrator</p>
              <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
              <p className="text-gray-500">{email}</p>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
                <UserCircleIcon className="h-4 w-4" />
                {roleLabel}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PlatformProfile
