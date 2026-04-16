import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import Footer from './Footer'

const RestaurantLayout = () => {
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
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/menu', label: 'Menu', icon: '📋' },
    { path: '/admin/categories', label: 'Categories', icon: '📁' },
    { path: '/admin/orders', label: 'Orders', icon: '🛒' },
    { path: '/admin/tables', label: 'Tables', icon: '🪑' },
    { path: '/admin/restaurant/qr', label: 'QR Code', icon: '🔳' },
    { path: '/admin/staff', label: 'Staff', icon: '👥' },
    { path: '/admin/inventory', label: 'Inventory', icon: '📦' },
    { path: '/admin/promotions', label: 'Promotions', icon: '🏷️' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { path: '/admin/reviews', label: 'Reviews', icon: '⭐' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
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
          title="Restaurant Dashboard"
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

export default RestaurantLayout