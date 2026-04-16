import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, UserPlusIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import Dropdown from '../../../common/Dropdown'

const QuickActions = () => {
  const navigate = useNavigate()

  const actions = [
    {
      label: 'Add New Restaurant',
      icon: PlusIcon,
      onClick: () => navigate('/platform/restaurants/new'),
    },
    {
      label: 'Create Admin User',
      icon: UserPlusIcon,
      onClick: () => navigate('/platform/users/new'),
    },
    {
      label: 'Generate Report',
      icon: DocumentTextIcon,
      onClick: () => navigate('/platform/analytics/reports'),
    },
    {
      label: 'View Analytics',
      icon: ChartBarIcon,
      onClick: () => navigate('/platform/analytics'),
    },
  ]

  const trigger = (
    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2">
      <PlusIcon className="w-4 h-4" />
      Quick Actions
    </button>
  )

  return <Dropdown trigger={trigger} items={actions} align="right" />
}

export default QuickActions