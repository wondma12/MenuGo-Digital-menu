import {useState, useEffect, useRef} from 'react'
import { Bell } from 'lucide-react'
import { useQuery } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import WaiterNotificationList from './WaiterNotificationList'
import { getWaiterUnreadCount } from '../../../services/notificationService'
import { useAuthStore } from '../../../store/authStore'

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const userId = useAuthStore((state) => state.user?.id)

  const { data: unreadCount = 0, refetch } = useQuery(
    ['unreadNotificationCount', userId],
    () => getWaiterUnreadCount(),
    {
      enabled: !!userId,
      refetchInterval: 30000,
    }
  )

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      refetch()
    }
  }, [isOpen, refetch])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <WaiterNotificationList />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell
