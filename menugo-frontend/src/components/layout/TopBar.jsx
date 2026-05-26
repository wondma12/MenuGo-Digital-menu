import React from 'react'
import { Bars3Icon } from '@heroicons/react/24/outline'

const TopBar = ({ title, user, actions, onMenuClick, showMenuButton = true }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-orange-100 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="rounded-xl p-2 text-gray-600 transition hover:bg-orange-50 hover:text-orange-700 lg:hidden"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Waiter Workspace</p>
            <h1 className="text-lg font-extrabold tracking-tight text-gray-900">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {actions}
        </div>
      </div>
    </div>
  )
}

export default TopBar