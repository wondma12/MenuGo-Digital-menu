import React from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { HeartIcon, HomeIcon } from '@heroicons/react/24/outline'

export default function Footer({ onOpenCart, restaurantId, centered = false }) {
  const { totalItems, totalPrice } = useCartStore()

  return (
    <>
      {/* Mobile quick-checkout bar (above footer) */}
      {totalItems > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-50 md:hidden px-4">
          {/* <div className="max-w-4xl mx-auto bg-primary-600 text-white rounded-lg p-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold">{totalItems} item{totalItems > 1 ? 's' : ''}</div>
              <div className="text-sm opacity-90">${(totalPrice || 0).toFixed(2)}</div>
            </div>
            <button onClick={onOpenCart} className="bg-white text-primary-600 px-3 py-2 rounded-md font-semibold">Checkout</button>
          </div> */}
        </div>
      )}

      <footer className="bg-white border-t mt-8">
        <div className={
          `max-w-4xl mx-auto px-4 py-6 ${
            centered ? 'flex items-center justify-center text-center' : 'flex flex-col md:flex-row items-center justify-between gap-4'
          }`
        }>
          {/* <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-600 flex items-center gap-2 hover:text-primary-600">
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link to={`/menu/${restaurantId}/favorites`} className="text-sm text-gray-600 flex items-center gap-2 hover:text-primary-600">
              <HeartIcon className="w-5 h-5" />
              <span>Favorites</span>
            </Link>
            <a href="mailto:hello@menugo.example" className="text-sm text-gray-600 hover:text-primary-600">Contact</a>
          </div> */}

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">© {new Date().getFullYear()} MenuGo. All rights reserved.</div>
          </div>

          
        </div>
      </footer>
    </>
  )
}
 