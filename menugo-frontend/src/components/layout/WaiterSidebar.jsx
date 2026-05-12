import React from 'react'
import { NavLink } from 'react-router-dom'
import Avatar from '../common/Avatar'
import { LogOut } from 'lucide-react'

const WaiterSidebar = ({ menuItems = [], user, onLogout }) => {
  return (
    <div className="flex flex-col h-full justify-between">
      {/* Logo */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="MenuGo" className="w-8 h-8" />
          <span className="text-xl font-bold text-primary-600">MenuGo</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 space-y-1 pb-6">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Section (pinned to bottom-left) */}
      <div className="p-4 border-t border-gray-200 flex flex-col items-start">
        <div className="flex items-center gap-3 mb-2">
          <Avatar name={user?.fullName} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default WaiterSidebar
