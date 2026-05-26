import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useWebSocket } from '../../hooks/useWebSocket'
import { useAudio } from '../../hooks/useAudio'
import TopBar from './TopBar'
import WaiterSidebar from './WaiterSidebar'
import BottomNav from './MobileNav'
import NotificationBell from '../waiter/notifications/NotificationBell'
import UserMenu from './UserMenu'
import toast from '../../utils/hotToastShim'
import { BarChart2, ShoppingCart, Table, Phone } from 'lucide-react'

const WaiterLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { lastMessage } = useWebSocket()
  const { playSound } = useAudio()
  const location = useLocation()

  useEffect(() => {
    if (lastMessage?.type === 'new_order') {
      playSound('new-order')
    }
  }, [lastMessage, playSound])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out')
      navigate('/login')
    } catch (error) {
      console.error('Logout failed', error)
      toast.error('Logout failed')
    }
  }

  const menuItems = [
    { path: '/waiter/dashboard', label: 'Dashboard', icon: <BarChart2 className="h-4 w-4" /> },
    { path: '/waiter/orders', label: 'Orders', icon: <ShoppingCart className="h-4 w-4" /> },
    { path: '/waiter/tables', label: 'Tables', icon: <Table className="h-4 w-4" /> },
    { path: '/waiter/calls', label: 'Calls', icon: <Phone className="h-4 w-4" /> },
  ]

  const mobileMenuItems = menuItems.filter((item) => item.path === '/waiter/orders' || item.path === '/waiter/calls')

  return (
    <div className="min-h-screen bg-white font-['Manrope',system-ui,sans-serif] text-gray-900">
      <TopBar
        title="Waiter Panel"
        user={user}
        actions={(
          <div className="flex items-center gap-3">
            <NotificationBell />
            <UserMenu user={user} onLogout={handleLogout} />
          </div>
        )}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton={true}
      />

      {/* Sidebar */}
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ type: 'tween', duration: 0.25 }}
          className="fixed left-0 top-0 z-30 h-screen w-64 border-r border-slate-200 bg-white/95 shadow-[12px_0_40px_rgba(15,23,42,0.06)] backdrop-blur"
        >
          <div className="h-full p-4">
            <WaiterSidebar menuItems={menuItems} user={user} onLogout={handleLogout} />
          </div>
        </motion.aside>
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'pl-64' : 'pl-0'}`}>
        <main className="bg-white pt-16 pb-24">
          <div className="container mx-auto px-3 sm:px-4 lg:px-8">
            {/* Header nav removed per request */}

            <motion.div
              className="mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>

      <BottomNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        menuItems={mobileMenuItems}
        user={user}
        onLogout={handleLogout}
      />
    </div>
  )
}

export default WaiterLayout