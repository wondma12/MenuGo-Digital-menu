import React from 'react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import NotificationBell from './NotificationBell'
import UserMenu from './UserMenu'

const Header = ({ title, user, onMenuClick, onMobileMenuClick, onLogout }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="hidden lg:block p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <button
            onClick={onMobileMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  )
}

export default Header