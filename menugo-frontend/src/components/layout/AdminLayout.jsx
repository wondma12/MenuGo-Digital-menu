import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import { BarChart2, Store, Users, CreditCard, TrendingUp, HelpCircle, Settings } from 'lucide-react'
import Footer from './Footer'

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
    navigate('/login')
  }

  const menuItems = [
    { path: '/platform/dashboard', label: 'Dashboard', icon: <BarChart2 className="w-5 h-5" /> },
    { path: '/platform/restaurants', label: 'Restaurants', icon: <Store className="w-5 h-5" /> },
    { path: '/platform/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { path: '/platform/subscriptions', label: 'Subscriptions', icon: <CreditCard className="w-5 h-5" /> },
    { path: '/platform/analytics', label: 'Analytics', icon: <TrendingUp className="w-5 h-5" /> },
    // { path: '/platform/support', label: 'Support', icon: <HelpCircle className="w-5 h-5" /> },
    { path: '/platform/system', label: 'System', icon: <Settings className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 z-30 h-screen w-64 bg-white shadow-lg"
          >
            <Sidebar menuItems={menuItems} onLogout={handleLogout} user={user} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Header
          title="Platform Admin"
          user={user}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onMobileMenuClick={() => setMobileMenuOpen(true)}
          onLogout={handleLogout}
        />
        <main className="p-6">
          <Outlet />
        </main>
        <Footer />
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