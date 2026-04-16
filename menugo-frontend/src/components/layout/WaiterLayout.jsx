import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useWebSocket } from '../../hooks/useWebSocket'
import { useAudio } from '../../hooks/useAudio'
import TopBar from './TopBar'
import BottomNav from './MobileNav'
import NotificationBell from './NotificationBell'
import UserMenu from './UserMenu'
import WaiterSidebar from './WaiterSidebar'
import Header from './Header'
import Footer from './Footer'
const WaiterLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { lastMessage } = useWebSocket()
  const { playSound } = useAudio()

  useEffect(() => {
    if (lastMessage?.type === 'new_order') {
      playSound('new-order')
    }
  }, [lastMessage, playSound])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/waiter/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/waiter/orders', label: 'Orders', icon: '🛒' },
    { path: '/waiter/tables', label: 'Tables', icon: '🪑' },
    { path: '/waiter/reservations', label: 'Reservations', icon: '📅' },
    { path: '/waiter/calls', label: 'Calls', icon: '📞' },
    { path: '/waiter/notifications', label: 'Notifications', icon: '🔔' },
    { path: '/waiter/profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        title="Waiter Panel"
        user={user}
        actions={
          <div className="flex items-center gap-3">
            <NotificationBell />
            <UserMenu user={user} onLogout={handleLogout} />
          </div>
        }
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />

      {/* Main Content */}
        <main className="pt-16 pb-20 lg:ml-64">
        <div className="container mx-auto px-6">
          <div className="lg:flex lg:items-start lg:space-x-6">
              <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 bg-white border-r border-gray-200">
                <WaiterSidebar menuItems={menuItems} onLogout={handleLogout} user={user} />
              </aside>

            <div className="flex-1 mt-6 lg:mt-0">
              <motion.div
                className="p-6 sm:p-8 bg-white rounded-lg shadow-sm space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Bottom Navigation (Mobile) */}
      <BottomNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        menuItems={menuItems}
        user={user}
        onLogout={handleLogout}
      />
    </div>
  )
}

export default WaiterLayout