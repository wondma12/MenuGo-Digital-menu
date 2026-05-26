import React, { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
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
    <div className="flex h-full flex-col bg-white/95 text-slate-900">
      {/* Logo */}
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="MenuGo" className="w-8 h-8" />
          <span className="text-xl font-bold text-orange-600">MenuGo</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {menuItems.map((item, index) => (




            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl border-l-4 px-3 py-2.5 transition-all duration-200 ${
                  isActive
                    ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-blue-50 text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.05)]'
                    : 'border-transparent text-slate-600 hover:border-orange-200 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="flex items-center gap-2 text-sm font-medium">
                {item.label}
                {item.path === '/platform/restaurants' && pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    {pendingCount}
                  </span>
                )}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar name={user?.fullName} size="md" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{user?.fullName}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        {/* <div className="mb-2">
          
        </div> */}
        <button
          onClick={onLogout}
          className="w-full rounded-lg px-3 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar