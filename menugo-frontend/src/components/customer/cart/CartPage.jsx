import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { useCartStore } from '../../../store/cartStore'
import CartItem from './CartItem'
import CartSummary from './CartSummary'
import TableInput from './TableInput'
import SpecialInstructions from './SpecialInstructions'
import OrderButton from './OrderButton'
import Button from '../../common/Button'
import { getRestaurantDetails } from '../../../services/restaurantService'

const CartPage = () => {
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  const { items, totalPrice, clearCart, removeItem, updateQuantity, tableNumber, setTableNumber } = useCartStore()
  const [instructions, setInstructions] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [orderType, setOrderType] = useState('dine_in')

  const { data: restaurant } = useQuery(
    ['restaurantDetails', restaurantId],
    () => getRestaurantDetails(restaurantId),
    { enabled: !!restaurantId }
  )

  const taxRate = Number(restaurant?.tax_rate ?? restaurant?.taxRate ?? 0) || 0
  const taxAmount = totalPrice * (taxRate / 100)
  const totalAmount = totalPrice + taxAmount

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white font-['Manrope',system-ui,sans-serif] text-slate-900 flex items-center justify-center">
        <div className="text-center">
          <img src="/assets/empty-states/empty-cart.svg" alt="Empty cart" className="w-48 h-48 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-600 mb-4">Add some items from the menu</p>
          <Button onClick={() => navigate(-1)} className="bg-orange-600 hover:bg-orange-700">Browse Menu</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-['Manrope',system-ui,sans-serif] text-slate-900 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-black text-slate-900 mb-6">Your Order</h1>

        <div className="bg-white rounded-xl p-4 space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Order Type</label>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="orderType" value="dine_in" checked={orderType === 'dine_in'} onChange={() => setOrderType('dine_in')} />
                <span className="text-sm text-slate-900">Dine In</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="orderType" value="takeaway" checked={orderType === 'takeaway'} onChange={() => setOrderType('takeaway')} />
                <span className="text-sm text-slate-900">Takeaway</span>
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
          <SpecialInstructions value={instructions} onChange={setInstructions} />
        </div>

        <CartSummary subtotal={totalPrice} tax={taxAmount} total={totalAmount} taxRate={taxRate} />

        <OrderButton
          restaurantId={restaurantId}
          items={items}
          tableNumber={tableNumber}
          specialInstructions={instructions}
          totalAmount={totalAmount}
          orderType={orderType}
          customerName={customerName}
          restaurant={restaurant}
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