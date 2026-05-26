import React from 'react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import NotificationBell from './NotificationBell'
import UserMenu from './UserMenu'

const Header = ({ title, user, onMenuClick, onMobileMenuClick, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 text-slate-800 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="relative mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="hidden rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 lg:block"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <button
            onClick={onMobileMenuClick}
            className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Open mobile menu"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-slate-900 truncate">{title}</h1>
        </div>

        <div className="flex items-center gap-3 min-w-0">
          <NotificationBell />
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  )
}

export default Header