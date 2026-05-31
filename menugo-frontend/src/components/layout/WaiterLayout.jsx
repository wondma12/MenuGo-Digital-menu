import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useWebSocket } from '../../hooks/useWebSocket'
import { useAudio } from '../../hooks/useAudio'
import Header from './Header'
import WaiterSidebar from './WaiterSidebar'
import BottomNav from './MobileNav'
import toast from '../../utils/hotToastShim'
import { BarChart2, ShoppingCart, Table, Phone } from 'lucide-react'
import { getRestaurantDetails } from '../../services/restaurantService'

const WaiterLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [restaurantBrand, setRestaurantBrand] = useState(null)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { lastMessage } = useWebSocket()
  const { playSound } = useAudio()

  useEffect(() => {
    if (lastMessage?.type === 'new_order') {
      playSound('new-order')
    }
  }, [lastMessage, playSound])

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

  useEffect(() => {
    let mounted = true

    const loadRestaurantBrand = async () => {
      const fallbackName = user?.restaurant?.name || user?.staff?.restaurant_name || 'Restaurant'
      const fallbackLogo = user?.restaurant?.logo_url || user?.restaurant?.logo || null

      const restaurantId = user?.restaurant_id || user?.restaurant?.id || user?.staff?.restaurant_id
      if (!restaurantId) {
        if (mounted) {
          setRestaurantBrand({ name: fallbackName, logo: fallbackLogo })
        }
        return
      }

      try {
        const details = await getRestaurantDetails(restaurantId)
        if (!mounted) return
        setRestaurantBrand({
          name: details?.name || fallbackName,
          logo: details?.logoUrl || details?.logo_url || details?.logo || fallbackLogo,
        })
      } catch (error) {
        if (!mounted) return
        setRestaurantBrand({ name: fallbackName, logo: fallbackLogo })
      }
    }

    loadRestaurantBrand()

    return () => {
      mounted = false
    }
  }, [user])

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
    <div className="flex h-screen flex-col overflow-hidden bg-white font-['Manrope',system-ui,sans-serif] text-gray-900">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed left-0 top-0 z-30 h-screen w-64 border-r border-slate-200 bg-white/95 shadow-[12px_0_40px_rgba(15,23,42,0.06)] backdrop-blur"
          >
            <div className="h-full p-4">
              <WaiterSidebar menuItems={menuItems} user={user} onLogout={handleLogout} restaurantBrand={restaurantBrand} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex min-h-0 flex-1 flex-col transition-all duration-300 ${sidebarOpen ? 'pl-64' : 'pl-0'}`}>
        <Header
          title="Waiter"
          user={user}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onMobileMenuClick={() => setIsMobileMenuOpen(true)}
          onLogout={handleLogout}
        />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white pb-24">
          <div className="container mx-auto px-3 sm:px-4 lg:px-8">
            <motion.div
              className="mt-4 min-w-0"
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
        brand={restaurantBrand}
        onLogout={handleLogout}
      />
    </div>
  )
}

export default WaiterLayout