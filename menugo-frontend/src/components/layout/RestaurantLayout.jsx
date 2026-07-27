import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { useAuthStore } from '../../store/authStore'
import Header from './Header'
import Sidebar from './Sidebar'
import { BarChart2, Clipboard, Folder, ShoppingCart, Table, QrCode, Users, Box, Tag, TrendingUp, Star, User, Settings } from 'lucide-react'
import MobileNav from './MobileNav'

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
    toast.success('Logged out')
    navigate('/login')
  }

  const location = useLocation()
  const isReviewsPage = location?.pathname && location.pathname.startsWith('/admin/reviews')
  const restaurantBrand = {
    name: user?.restaurant?.name || user?.restaurant?.restaurant_name || 'MenuGo',
    logo: user?.restaurant?.logo_url || user?.restaurant?.logoUrl || user?.restaurant?.logo || '/logo.svg',
  }

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <BarChart2 className="w-5 h-5" /> },
    { path: '/admin/menu', label: 'Menu', icon: <Clipboard className="w-5 h-5" /> },
    { path: '/admin/categories', label: 'Categories', icon: <Folder className="w-5 h-5" /> },
    { path: '/admin/orders', label: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
    // Kitchen intentionally omitted from restaurant admin sidebar
    { path: '/admin/tables', label: 'Tables', icon: <Table className="w-5 h-5" /> },
    { path: '/admin/restaurant/qr', label: 'QR Code', icon: <QrCode className="w-5 h-5" /> },
    { path: '/admin/staff', label: 'Staff', icon: <Users className="w-5 h-5" /> },
    // { path: '/admin/inventory', label: 'Inventory', icon: <Box className="w-5 h-5" /> },
    // { path: '/admin/promotions', label: 'Promotions', icon: <Tag className="w-5 h-5" /> },
    { path: '/admin/analytics', label: 'Analytics', icon: <TrendingUp className="w-5 h-5" /> },
    { path: '/admin/reviews', label: 'Reviews', icon: <Star className="w-5 h-5" /> },
    // { path: '/admin/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ]

  // For restaurant admin layout we always show the admin menu items.
  // Staff-specific UIs (chef) use the KitchenLayout instead of RestaurantLayout.
  const visibleMenuItems = menuItems

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
            <Sidebar menuItems={visibleMenuItems} onLogout={handleLogout} user={user} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex min-h-0 flex-1 flex-col transition-all duration-300 ${sidebarOpen ? 'pl-64' : 'pl-0'}`}>
        <Header
          title="Restaurant Dashboard"
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
        menuItems={visibleMenuItems}
        user={user}
        onLogout={handleLogout}
        brand={restaurantBrand}
      />
    </div>
  )
}

export default RestaurantLayout