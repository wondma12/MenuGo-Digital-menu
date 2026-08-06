
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
    <button className="inline-flex items-center gap-2 rounded-none bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:-translate-y-0.5 hover:from-orange-700 hover:to-orange-600">
      <PlusIcon className="w-4 h-4" />
      Quick Actions
    </button>
  )

  return <Dropdown trigger={trigger} items={actions} align="right" className="rounded-none" />
}

export default QuickActions