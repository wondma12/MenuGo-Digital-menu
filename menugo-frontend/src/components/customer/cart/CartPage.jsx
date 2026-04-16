import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCartStore } from '../../../store/cartStore'
import CartItem from './CartItem'
import CartSummary from './CartSummary'
import TableInput from './TableInput'
import SpecialInstructions from './SpecialInstructions'
import OrderButton from './OrderButton'
import Button from '../../common/Button'

const CartPage = () => {
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  const { items, totalPrice, clearCart, removeItem, updateQuantity } = useCartStore()
  const [tableNumber, setTableNumber] = useState('')
  const [instructions, setInstructions] = useState('')

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <img src="/assets/empty-states/empty-cart.svg" alt="Empty cart" className="w-48 h-48 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-4">Add some items from the menu</p>
          <Button onClick={() => navigate(-1)}>Browse Menu</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Order</h1>

        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        <div className="bg-white rounded-xl p-4 space-y-4 mb-6">
          <TableInput value={tableNumber} onChange={setTableNumber} />
          <SpecialInstructions value={instructions} onChange={setInstructions} />
        </div>

        <CartSummary subtotal={totalPrice} tax={totalPrice * 0.1} total={totalPrice * 1.1} />

        <OrderButton
          restaurantId={restaurantId}
          items={items}
          tableNumber={tableNumber}
          specialInstructions={instructions}
          totalAmount={totalPrice * 1.1}
          onSuccess={() => {
            clearCart()
            navigate(`/menu/${restaurantId}`)
          }}
        />
      </div>
    </div>
  )
}

export default CartPage