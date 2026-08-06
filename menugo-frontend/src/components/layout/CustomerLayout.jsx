import {useState, useEffect} from 'react'
import { Outlet, useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCartStore } from '../../store/cartStore'
import { useRestaurantStore } from '../../store/restaurantStore'
import CartDrawer from '../customer/cart/CartDrawer'
import Header from './Header'
import { HeartIcon } from '@heroicons/react/24/outline'
import Footer from './Footer'

const CustomerLayout = () => {
  const { restaurantId } = useParams()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { items, totalItems } = useCartStore()
  const { restaurant, fetchRestaurant } = useRestaurantStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()

  // Only enable "embed" simplified rendering when the app is actually embedded (iframe).
  // This prevents direct/top-level visits to `/menu/:id` from showing the stripped-down view.
  const embedQuery = searchParams.get('embed') === '1' || searchParams.get('embed') === 'true'
  let embedMode = false
  try {
    const inIframe = typeof window !== 'undefined' && window.self !== window.top
    embedMode = !!embedQuery && inIframe
  } catch (err) {
    embedMode = false
  }

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurant(restaurantId)
    }
  }, [restaurantId, fetchRestaurant])

  if (embedMode) {
    // Embed/full-screen mode for QR scans: render just the customer content
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              ← Back
            </button>
            
            <div className="text-center">
              <h1 className="font-semibold text-lg sm:text-xl text-gray-900">{restaurant?.name || 'Menu'}</h1>
              <p className="text-xs sm:text-sm text-gray-500">{restaurant?.cuisineType}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/menu/${restaurantId}/favorites`)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                aria-label="Favorites"
              >
                <HeartIcon className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                aria-label="Open cart"
              >
                🛒
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        restaurantId={restaurantId}
      />
      <Footer onOpenCart={() => setIsCartOpen(true)} restaurantId={restaurantId} restaurant={restaurant} />
    </div>
  )
}

export default CustomerLayout