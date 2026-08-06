import {useState, useEffect, useRef} from 'react'
import { BellIcon } from '@heroicons/react/24/outline'
import { Check, Star, Settings, Bell } from 'lucide-react'
import { useQuery } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { getUnreadNotificationCount, getNotifications, markNotificationAsRead } from '../../services/notificationService'
import { useAuthStore } from '../../store/authStore'

const NotificationBell = ({ inHeader = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const dropdownRef = useRef(null)
  const userId = useAuthStore((state) => state.user?.id)

  const { data: unreadCount = 0, refetch: refetchCount } = useQuery(
    ['unreadCount', userId],
    () => getUnreadNotificationCount(),
    {
      enabled: !!userId,
      refetchInterval: 30000,
    }
  )

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = async () => {
    const data = await getNotifications()
    setNotifications(data?.data?.notifications || [])
  }

  const handleMarkAsRead = async (id) => {
    await markNotificationAsRead(id)
    await loadNotifications()
    refetchCount()
  }

  const getNotificationIcon = (type) => {
    const icons = {
      new_order: <Bell className="w-5 h-5" />, 
      order_ready: <Check className="w-5 h-5" />,
      order_served: <Star className="w-5 h-5" />,
      system: <Settings className="w-5 h-5" />,
    }
    return icons[type] || <Bell className="w-5 h-5" />
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors ${inHeader ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}
        aria-label="Notifications"
      >
        <BellIcon className="w-5 h-5" />
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
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className="text-xl">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell
