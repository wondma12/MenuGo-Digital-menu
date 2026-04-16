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
  const [viewMode, setViewMode] = useState('grid')
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-500 mt-1">Manage your restaurant team members</p>
          </div>
          <div className="flex gap-3">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
              >
                List
              </button>
            </div>
            <Button onClick={() => setShowModal(true)} icon={PlusIcon}>
              Add Staff
            </Button>
          </div>
        </div>

        <StaffFilters filters={filters} onFiltersChange={setFilters} />

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {staff?.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <StaffCard
                  staff={member}
                  onEdit={() => {
                    setEditingStaff(member)
                    setShowModal(true)
                  }}
                  onRefresh={refetch}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <StaffList staff={staff || []} onEdit={setEditingStaff} onRefresh={refetch} />
        )}
      </>
    )
  }

  return (
    <div className="p-6">
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
    </div>
  )
}

export default StaffManagement