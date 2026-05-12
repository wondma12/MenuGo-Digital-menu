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
  const { items, totalPrice, clearCart, removeItem, updateQuantity, tableNumber, setTableNumber } = useCartStore()
  const [instructions, setInstructions] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [orderType, setOrderType] = useState('dine_in')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')

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

        <div className="bg-white rounded-xl p-4 space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="orderType" value="dine_in" checked={orderType === 'dine_in'} onChange={() => setOrderType('dine_in')} />
                <span className="text-sm">Dine In</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="orderType" value="takeaway" checked={orderType === 'takeaway'} onChange={() => setOrderType('takeaway')} />
                <span className="text-sm">Takeaway</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="orderType" value="delivery" checked={orderType === 'delivery'} onChange={() => setOrderType('delivery')} />
                <span className="text-sm">Delivery</span>
              </label>
            </div>
          </div>
        </div>

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
          {orderType === 'dine_in' && <TableInput value={tableNumber} onChange={setTableNumber} />}
          {orderType === 'delivery' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter delivery address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Your phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Your email (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}
          <SpecialInstructions value={instructions} onChange={setInstructions} />
        </div>

        <CartSummary subtotal={totalPrice} tax={totalPrice * 0.1} total={totalPrice * 1.1} />

        <OrderButton
          restaurantId={restaurantId}
          items={items}
          tableNumber={tableNumber}
          specialInstructions={instructions}
          totalAmount={totalPrice * 1.1}
          orderType={orderType}
          customerName={customerName}
          customerPhone={customerPhone}
          customerEmail={customerEmail}
          deliveryAddress={deliveryAddress}
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