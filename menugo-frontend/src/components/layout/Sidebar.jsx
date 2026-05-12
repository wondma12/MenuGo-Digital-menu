import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import Avatar from '../common/Avatar'
import { getPendingVerifications } from '../../services/restaurantService'

const Sidebar = ({ menuItems, onLogout, user }) => {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        if (user?.role === 'platform_admin') {
          const list = await getPendingVerifications()
          if (mounted) setPendingCount(Array.isArray(list) ? list.length : (list?.length || 0))
        }
      } catch (e) {
        // ignore
      }
    }

    load()

    const id = setInterval(load, 30000)
    return () => { mounted = false; clearInterval(id) }
  }, [user])
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="MenuGo" className="w-8 h-8" />
          <span className="text-xl font-bold text-primary-600">MenuGo</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 space-y-1">
          {menuItems.map((item, index) => (




            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-medium flex items-center gap-2">
                {item.label}
                {item.path === '/platform/restaurants' && pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {pendingCount}
                  </span>
                )}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <Avatar name={user?.fullName} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar