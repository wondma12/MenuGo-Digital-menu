import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useCartStore } from '../../../store/cartStore'
import CartItem from './CartItem'
import CartSummary from './CartSummary'

const CartDrawer = ({ isOpen, onClose, restaurantId }) => {
  const navigate = useNavigate()
  const { items, totalPrice, clearCart, removeItem, updateQuantity } = useCartStore()

  const handleCheckout = () => {
    navigate(`/menu/${restaurantId}/cart`)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 md:w-[28rem] bg-white shadow-xl z-50 flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Your Cart ({items.length})</h2>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button onClick={clearCart} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
                <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <img src="/assets/empty-states/empty-cart.svg" alt="Empty cart" className="w-36 h-36 sm:w-48 sm:h-48 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t border-gray-200 space-y-4">
                <CartSummary subtotal={totalPrice} tax={totalPrice * 0.1} total={totalPrice * 1.1} />
                <button onClick={handleCheckout} className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer