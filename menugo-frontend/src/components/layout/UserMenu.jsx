import {useState, useRef, useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRightOnRectangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import Avatar from '../common/Avatar'

const UserMenu = ({ user, onLogout, inHeader = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navigate = useNavigate()

  const settingsPath = user?.role === 'platform_admin'
    ? '/platform/profile'
    : user?.role === 'waiter'
      ? '/waiter/profile'
      : user?.role === 'restaurant_admin'
        ? '/admin/settings'
        : '/settings'

  const menuItems = [
    { label: 'Settings', icon: Cog6ToothIcon, path: settingsPath },
    { label: 'Logout', icon: ArrowRightOnRectangleIcon, onClick: onLogout, danger: true },
  ]

  return (
    <div className="relative z-50" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-1 rounded-lg transition-colors ${inHeader ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
        aria-label="User menu"
      >
        <Avatar name={user?.fullName} size="sm" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 z-[70] mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            <div className="p-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{String(user?.role || 'account').replace('_', ' ')}</p>
            </div>
            <div className="py-1">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick()
                    } else if (item.path) {
                      navigate(item.path)
                    }
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 transition-colors ${
                    item.danger
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserMenu