import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { useAuthStore } from '../../store/authStore'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import { BarChart2, Store, Users, CreditCard, TrendingUp, HelpCircle, Settings, Phone } from 'lucide-react'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const location = useLocation()
  const isPlatformReviewsPage = location?.pathname && location.pathname.startsWith('/platform/reviews')

  const menuItems = [
    { path: '/platform/dashboard', label: 'Dashboard', icon: <BarChart2 className="w-5 h-5" /> },
    { path: '/platform/restaurants', label: 'Restaurants', icon: <Store className="w-5 h-5" /> },
    { path: '/platform/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { path: '/platform/subscriptions', label: 'Subscriptions', icon: <CreditCard className="w-5 h-5" /> },
    { path: '/platform/analytics', label: 'Analytics', icon: <TrendingUp className="w-5 h-5" /> },
    { path: '/platform/contact-messages', label: 'Contact Messages', icon: <Phone className="w-5 h-5" /> },
    { path: '/platform/profile', label: 'System', icon: <Settings className="w-5 h-5" /> },
  ]

  return (
    <div className={`flex h-screen flex-col bg-slate-50 text-slate-900 overflow-hidden`}>
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 z-30 h-screen w-64 border-r border-slate-200 bg-white/95 shadow-[12px_0_40px_rgba(15,23,42,0.06)] backdrop-blur"
          >
            <Sidebar menuItems={menuItems} onLogout={handleLogout} user={user} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex min-h-0 flex-1 flex-col transition-all duration-300 ${sidebarOpen ? 'pl-64' : 'pl-0'}`}>
        <Header
          title="Platform Admin"
          user={user}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onMobileMenuClick={() => setMobileMenuOpen(true)}
          onLogout={handleLogout}
        />
        <main className={`min-h-0 flex-1 overflow-y-auto p-6 text-slate-900 min-w-0 overflow-x-hidden`}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        menuItems={menuItems}
        user={user}
        onLogout={handleLogout}
      />
    </div>
  )
}

export default AdminLayout