import React from 'react'
import { Bars3Icon } from '@heroicons/react/24/outline'

const TopBar = ({ title, user, actions, onMenuClick }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {actions}
        </div>
      </div>
    </div>
  )
}

export default TopBar