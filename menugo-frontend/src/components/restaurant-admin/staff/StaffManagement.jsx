import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { PlusIcon, UserGroupIcon, CalendarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import StaffList from './StaffList'
import StaffCard from './StaffCard'
import StaffModal from './StaffModal'
import StaffFilters from './StaffFilters'
import StaffSchedule from './StaffSchedule'
import RoleManagement from './RoleManagement'
import PermissionManager from './PermissionManager'
import Button from '../../../common/Button'
import Loading from '../../../common/Loading'
import Tabs from '../../../common/Tabs'
import { getStaff } from '../../../services/staffService'
import { useAuthStore } from '../../../store/authStore'

const StaffManagement = () => {
  
  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: '',
  })

  const { user } = useAuthStore()

  // Merge restaurant context into request params so API returns only this restaurant's staff
  const restaurantId = user?.restaurant_id?.id || user?.restaurant_id || user?.restaurant?.id || null
  const isPlatformAdmin = user?.role === 'platform_admin'
  const requestParams = isPlatformAdmin ? { ...filters } : { ...filters, restaurantId }

  const canFetch = isPlatformAdmin || !!restaurantId
  const { data: staff, isLoading, refetch } = useQuery(['staff', requestParams], () => getStaff(requestParams), { enabled: canFetch })

  // Ensure filters hold restaurantId so child filter component preserves it when clearing
  React.useEffect(() => {
    if (!isPlatformAdmin && restaurantId) {
      setFilters((prev) => ({ ...prev, restaurantId }))
    }
  }, [isPlatformAdmin, restaurantId])

  if (isLoading) return <Loading />

  const tabs = [
    { label: 'Staff Members', icon: UserGroupIcon, content: renderStaffContent() },
    { label: 'Schedule', icon: CalendarIcon, content: <StaffSchedule staff={staff || []} /> },
    { label: 'Roles & Permissions', icon: ShieldCheckIcon, content: <RoleManagement /> },
  ]

  function renderStaffContent() {
    return (
      <>
        <div className="mb-6 flex flex-col gap-4 rounded-none border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Restaurant staff</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Staff Management</h1>
            <p className="text-sm leading-6 text-slate-500 sm:text-base">Manage your restaurant team members with the analytics palette.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button onClick={() => setShowModal(true)} icon={PlusIcon} className="w-full rounded-none bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2.5 text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-orange-600 sm:w-auto">
              Add Staff
            </Button>
          </div>
        </div>

        <StaffFilters filters={filters} onFiltersChange={setFilters} />

        <div className="mt-6">
          <StaffList
            staff={staff || []}
            onEdit={(member) => {
              setEditingStaff(member)
              setShowModal(true)
            }}
            onRefresh={refetch}
          />
        </div>
      </>
    )
  }

  return (
    <div className="relative overflow-hidden space-y-6 bg-white p-4 sm:p-6 lg:p-8 font-['Manrope',system-ui,sans-serif] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.08),transparent_35%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      {/* <div className="relative mx-auto max-w-7xl space-y-6"> */}
        <Tabs tabs={tabs} />
      
        <StaffModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setEditingStaff(null)
          }}
          staff={editingStaff}
          onSuccess={() => {
            refetch()
            setShowModal(false)
            setEditingStaff(null)
          }}
        />
      {/* </div> */}
    </div>
  )
}

export default StaffManagement