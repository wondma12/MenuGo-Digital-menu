// src/components/layout/MobileNav.jsx
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { BarChart2, Store, Users, CreditCard, TrendingUp, HelpCircle, Settings, Clipboard, QrCode, Database, LogOut } from 'lucide-react'

const MobileNav = ({ isOpen, onClose, menuItems, user, onLogout }) => {
  const [expandedMenus, setExpandedMenus] = useState({})

  const toggleSubmenu = (path) => {
    setExpandedMenus(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  }

  const navItems = [
    { path: '/platform/dashboard', label: 'Dashboard', icon: <BarChart2 className="w-5 h-5" /> },
    { path: '/platform/restaurants', label: 'Restaurants', icon: <Store className="w-5 h-5" /> },
    { path: '/platform/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { path: '/platform/subscriptions', label: 'Subscriptions', icon: <CreditCard className="w-5 h-5" /> },
    { path: '/platform/analytics', label: 'Analytics', icon: <TrendingUp className="w-5 h-5" /> },
    { path: '/platform/support', label: 'Support', icon: <HelpCircle className="w-5 h-5" /> },
    { 
      path: '/platform/system', 
      label: 'System', 
      icon: <Settings className="w-5 h-5" />,
      submenu: [
        { path: '/platform/system/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
        { path: '/platform/system/audit-logs', label: 'Audit Logs', icon: <Clipboard className="w-5 h-5" /> },
        { path: '/platform/system/health', label: 'System Health', icon: <Database className="w-5 h-5" /> },
        { path: '/platform/system/backups', label: 'Backups', icon: <Database className="w-5 h-5" /> },
      ]
    },
  ]

  // Use menuItems passed from layout when available (per-layout mobile menus)
  const items = menuItems && menuItems.length ? menuItems : navItems

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="MenuGo" className="h-8 w-auto" />
                <span className="text-xl font-bold text-gray-900">MenuGo</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.full_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.full_name || 'Admin User'}</p>
                  <p className="text-sm text-gray-500">{user?.email || 'admin@menugo.com'}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.path}>
                    {item.submenu ? (
                      <div>
                        <button
                          onClick={() => toggleSubmenu(item.path)}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium text-gray-900">{item.label}</span>
                          </div>
                          {expandedMenus[item.path] ? (
                            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {expandedMenus[item.path] && (
                            <motion.ul
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-8 mt-1 space-y-1 overflow-hidden"
                            >
                              {item.submenu.map((subItem) => (
                                <li key={subItem.path}>
                                  <NavLink
                                    to={subItem.path}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                        isActive
                                          ? 'bg-blue-50 text-blue-600'
                                          : 'text-gray-600 hover:bg-gray-50'
                                      }`
                                    }
                                  >
                                    <span>{subItem.icon}</span>
                                    <span>{subItem.label}</span>
                                  </NavLink>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <NavLink
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`
                        }
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onLogout()
                  onClose()
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MobileNav