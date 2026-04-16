import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { User, Star } from 'lucide-react'
import ProfileForm from './ProfileForm'
import ChangePassword from './ChangePassword'
import AvailabilitySchedule from './AvailabilitySchedule'
import PerformanceStats from './PerformanceStats'
import Tabs from '../../common/Tabs'
import Avatar from '../../common/Avatar'
import Loading from '../../common/Loading'
import { getWaiterProfile } from '../../../services/waiterService'

const WaiterProfile = () => {
  const { data: profile, isLoading } = useQuery('waiterProfile', getWaiterProfile)

  if (isLoading) return <Loading />

  const tabs = [
    { label: 'Profile', content: <ProfileForm profile={profile} /> },
    { label: 'Security', content: <ChangePassword /> },
    { label: 'Availability', content: <AvailabilitySchedule /> },
    { label: 'Performance', content: <PerformanceStats stats={profile?.performance} /> }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-6">
          <Avatar src={profile?.avatar} name={profile?.name} size="xl" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile?.name}</h1>
            <p className="text-gray-500">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-600">{profile?.rating || 0} / 5</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-sm text-gray-600">{profile?.totalOrders || 0} orders served</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} />
    </div>
  )
}

export default WaiterProfile