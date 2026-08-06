
import { useNavigate } from 'react-router-dom'
import {
  PlusIcon,
  DocumentTextIcon,
  QrCodeIcon,
  UserPlusIcon,
  ChartBarIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline'
import Dropdown from '../../../common/Dropdown'

const QuickActions = ({ restaurantId }) => {
  const navigate = useNavigate()

  const actions = [
    {
      label: 'Add Menu Item',
      icon: PlusIcon,
      onClick: () => navigate('/admin/menu'),
      description: 'Go to menu management',
    },
    {
      label: 'Generate QR Code',
      icon: QrCodeIcon,
      onClick: () => navigate('/admin/restaurant/qr'),
      description: 'Create QR codes for tables',
    },
    {
      label: 'Add Staff Member',
      icon: UserPlusIcon,
      onClick: () => navigate('/admin/staff'),
      description: 'Invite new staff members',
    },
    {
      label: 'Create Order',
      icon: ShoppingBagIcon,
      onClick: () => navigate('/admin/orders'),
      description: 'Place a new order',
    },
    {
      label: 'View Reports',
      icon: DocumentTextIcon,
      onClick: () => navigate('/admin/analytics'),
      description: 'See performance reports',
    },
    {
      label: 'View Analytics',
      icon: ChartBarIcon,
      onClick: () => navigate('/admin/analytics'),
      description: 'Detailed business analytics',
    },
  ]

  const trigger = (
    <button className="inline-flex items-center gap-2 rounded-none bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:-translate-y-0.5 hover:from-orange-700 hover:to-orange-600">
      <PlusIcon className="w-4 h-4" />
      Quick Actions
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )

  const dropdownItems = actions.map((action) => ({
    label: (
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-gray-100 rounded-lg">
          <action.icon className="w-4 h-4 text-gray-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{action.label}</p>
          <p className="text-xs text-gray-500">{action.description}</p>
        </div>
      </div>
    ),
    onClick: action.onClick,
  }))

  return <Dropdown trigger={trigger} items={dropdownItems} align="right" />
}

export default QuickActions